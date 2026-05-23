#!/usr/bin/env tsx
/**
 * Faithfulness Evaluation Script
 * 
 * Tests whether generated answers are faithful to the retrieved chunks.
 * 
 * Metrics:
 * - Faithfulness score (0-10): LLM-as-judge rating
 * - Hallucination detection: Whether answer contains info not in chunks
 * - Reference match: Similarity to reference answer
 * 
 * Usage:
 *   npm run eval:faithfulness
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import OpenAI from 'openai';
import { searchKnowledge } from '../../lib/knowledge/retriever';
import { getSupabaseAdmin } from '../../lib/knowledge/supabase-admin';

config({ path: '.env.local' });

// School name mappings (same as recall evaluation)
const SCHOOL_MAPPINGS: Record<string, string> = {
  '皇艺': 'royal-college-art',
  'rca': 'royal-college-art',
  'csm': 'central-saint-martins',
  '中央圣马丁': 'central-saint-martins',
  'ual': 'university-arts-london',
  '伦艺': 'university-arts-london',
  'parsons': 'parsons-school-design',
  '帕森斯': 'parsons-school-design',
  'pratt': 'pratt-institute',
  'risd': 'risd',
  'scad': 'scad',
  'sva': 'school-visual-arts',
};

function extractSchoolSlug(question: string): string | null {
  const lowerQ = question.toLowerCase();
  
  for (const [keyword, slug] of Object.entries(SCHOOL_MAPPINGS)) {
    if (lowerQ.includes(keyword.toLowerCase())) {
      return slug;
    }
  }
  
  return null;
}

async function getSchoolId(schoolSlug: string): Promise<string | null> {
  const supabase = getSupabaseAdmin() as any;
  const { data, error } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', schoolSlug)
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

const GOLDEN_PATH = path.join(process.cwd(), 'eval', 'golden.jsonl');
const PROMPT_PATH = path.join(
  process.cwd(),
  'lib',
  'knowledge',
  'prompts',
  'eval.faithfulness.v1.md'
);

interface GoldenItem {
  id: string;
  turns: number;
  question: string;
  intent_expected: string;
  must_cite_chunk_ids?: string[];
  reference_answer?: string;
  history?: Array<{ role: string; content: string }>;
  note?: string;
  skip_reason?: string;
}

interface FaithfulnessResult {
  question_id: string;
  question: string;
  reference_answer: string;
  generated_answer: string;
  retrieved_chunks: string[];
  faithfulness_score: number;
  has_hallucination: boolean;
  judge_reasoning: string;
}

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

async function loadGolden(): Promise<GoldenItem[]> {
  const content = await fs.readFile(GOLDEN_PATH, 'utf-8');
  return content
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

async function generateAnswer(question: string): Promise<{
  answer: string;
  chunks: string[];
}> {
  // Extract school from question
  const schoolSlug = extractSchoolSlug(question);
  let schoolId: string | null = null;
  
  if (schoolSlug) {
    schoolId = await getSchoolId(schoolSlug);
  }

  // Retrieve chunks
  const results = await searchKnowledge(question, {
    matchCount: 5,
    matchThreshold: 0.4,
    schoolId: schoolId || undefined,
  });

  if (results.length === 0) {
    return {
      answer: '抱歉，我在知识库中没有找到相关信息。',
      chunks: [],
    };
  }

  // Build context
  const context = results
    .map((r, i) => `[Chunk ${i + 1}]\n${r.headingPath}\n${r.chunkText}`)
    .join('\n\n');

  // Generate answer using DeepSeek
  const message = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `你是一个艺术留学咨询助手。请根据以下知识库内容回答用户问题。

知识库内容：
${context}

用户问题：${question}

请用中文回答，只使用知识库中的信息，不要编造内容。如果知识库中没有相关信息，请明确说明。`,
      },
    ],
  });

  const answer = message.choices[0].message.content || '';

  return {
    answer,
    chunks: results.map((r) => r.chunkText),
  };
}

async function judgeFaithfulness(
  question: string,
  referenceAnswer: string,
  generatedAnswer: string,
  chunks: string[]
): Promise<{
  score: number;
  hasHallucination: boolean;
  reasoning: string;
}> {
  const prompt = `你是一个严格的评审员，负责评估生成答案的忠实度（faithfulness）。

用户问题：
${question}

参考答案（ground truth）：
${referenceAnswer}

生成答案：
${generatedAnswer}

检索到的知识库内容：
${chunks.map((c, i) => `[Chunk ${i + 1}]\n${c}`).join('\n\n')}

请评估生成答案的质量，考虑以下维度：

1. **忠实度（Faithfulness）**：生成答案是否只使用了检索到的知识库内容，没有编造信息？
2. **幻觉检测（Hallucination）**：生成答案是否包含知识库中没有的信息？
3. **与参考答案的一致性**：生成答案是否与参考答案表达了相同的核心信息？

请以 JSON 格式输出评估结果：
{
  "score": <0-10的整数，10分表示完全忠实>,
  "has_hallucination": <true/false，是否有幻觉>,
  "reasoning": "<详细解释评分理由>"
}`;

  const message = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText =
    message.choices[0].message.content || '';

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn('Failed to parse judge response, using default values');
    return {
      score: 0,
      hasHallucination: true,
      reasoning: 'Failed to parse judge response',
    };
  }

  // Clean control characters from JSON string
  const cleanedJson = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, '');
  
  const result = JSON.parse(cleanedJson);
  return {
    score: result.score || 0,
    hasHallucination: result.has_hallucination || false,
    reasoning: result.reasoning || '',
  };
}

async function evaluateFaithfulness(
  item: GoldenItem
): Promise<FaithfulnessResult | null> {
  if (!item.reference_answer) {
    return null;
  }

  console.log(`\n📝 ${item.id}: ${item.question}`);

  // Generate answer
  const { answer, chunks } = await generateAnswer(item.question);
  console.log(`   Generated answer: ${answer.substring(0, 100)}...`);

  // Judge faithfulness
  const { score, hasHallucination, reasoning } = await judgeFaithfulness(
    item.question,
    item.reference_answer,
    answer,
    chunks
  );

  console.log(`   Faithfulness score: ${score}/10`);
  console.log(`   Has hallucination: ${hasHallucination ? '❌' : '✅'}`);

  return {
    question_id: item.id,
    question: item.question,
    reference_answer: item.reference_answer,
    generated_answer: answer,
    retrieved_chunks: chunks,
    faithfulness_score: score,
    has_hallucination: hasHallucination,
    judge_reasoning: reasoning,
  };
}

async function main() {
  console.log('🔍 Faithfulness Evaluation\n');

  const items = await loadGolden();
  const testableItems = items.filter((item) => item.reference_answer);

  console.log(`Total questions: ${items.length}`);
  console.log(`With reference answers: ${testableItems.length}\n`);

  if (testableItems.length === 0) {
    console.log('❌ No questions with reference answers to evaluate');
    process.exit(1);
  }

  const results: FaithfulnessResult[] = [];

  for (const item of testableItems) {
    const result = await evaluateFaithfulness(item);
    if (result) {
      results.push(result);
    }
  }

  // Calculate aggregate metrics
  const avgScore =
    results.reduce((sum, r) => sum + r.faithfulness_score, 0) / results.length;
  const hallucinationCount = results.filter((r) => r.has_hallucination).length;
  const hallucinationRate = (hallucinationCount / results.length) * 100;

  console.log('\n' + '='.repeat(80));
  console.log('📊 Summary\n');
  console.log(`Total evaluated: ${results.length}`);
  console.log(`Average faithfulness score: ${avgScore.toFixed(1)}/10`);
  console.log(
    `Hallucination rate: ${hallucinationCount}/${results.length} (${hallucinationRate.toFixed(1)}%)`
  );

  // Show low-scoring answers
  const lowScores = results.filter((r) => r.faithfulness_score < 7);
  if (lowScores.length > 0) {
    console.log('\n⚠️  Low faithfulness scores (<7):\n');
    for (const result of lowScores) {
      console.log(`   ${result.question_id}: ${result.question}`);
      console.log(`   Score: ${result.faithfulness_score}/10`);
      console.log(`   Reasoning: ${result.judge_reasoning.substring(0, 100)}...`);
      console.log('');
    }
  }

  // Save detailed results
  const outputPath = path.join(process.cwd(), 'eval', 'faithfulness-results.json');
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        summary: {
          total: results.length,
          avg_faithfulness_score: avgScore,
          hallucination_rate: hallucinationRate,
        },
        results,
      },
      null,
      2
    )
  );

  console.log('='.repeat(80));
  console.log(`📁 Detailed results saved to: ${outputPath}`);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
