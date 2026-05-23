#!/usr/bin/env tsx
/**
 * Question candidate generator for golden.jsonl
 * 
 * Usage:
 *   npm run eval:generate-candidates
 * 
 * Generates 100+ candidate questions using DeepSeek-V3, emphasizing:
 * - Colloquial, real-world phrasing (not textbook-style)
 * - Mixed Chinese/English, typos, slang
 * - Edge cases and boundary questions
 * 
 * Output: eval/question-candidates.jsonl
 * You then manually select 60 best ones → copy to golden.jsonl
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';

// Load .env.local
config({ path: path.join(process.cwd(), '.env.local') });

const CANDIDATES_PATH = path.join(process.cwd(), 'eval', 'question-candidates.jsonl');

interface QuestionCandidate {
  id: string;
  turns: number;
  question: string;
  intent_expected: string;
  history?: Array<{ role: string; content: string }>;
  note?: string; // Why this question is interesting
}

const GENERATION_PROMPT = `You are generating evaluation questions for an art school application consulting chatbot.

**CRITICAL: Generate REAL-WORLD user questions, NOT textbook-style queries.**

## Bad Examples (too formal, will pass in dev but fail in production)
❌ "RCA Fine Art MA 的学费是多少？"
❌ "What are the application requirements for Royal College of Art?"
❌ "请问皇家艺术学院的申请截止日期是什么时候？"

## Good Examples (how real users actually ask)
✅ "皇艺纯艺研究生一年要多少钱啊"
✅ "我画画一般能申 RCA 吗"
✅ "rca作品集要几个项目"
✅ "皇艺和csm纯艺哪个好啊"
✅ "ual illustration ddl 啥时候"

## Characteristics of Real Questions
1. **Mixed language**: "皇艺 Fine Art 怎么样", "rca学费多少"
2. **Colloquial**: "啊", "吗", "呢", "哦", casual tone
3. **Abbreviations**: "rca", "csm", "ual", "ddl" (deadline)
4. **Omit subjects**: "作品集要几个项目" (no "我" or "RCA")
5. **Typos/variants**: "皇艺" vs "皇家艺术学院", "纯艺" vs "Fine Art"
6. **Vague phrasing**: "画画一般", "背景不太好", "有点想申"
7. **Comparison**: "A vs B", "哪个好", "更适合我"
8. **Implicit context**: Assumes chatbot knows what "那个" refers to

## Intent Categories (distribute evenly)

### hard_data (25 questions)
Factual queries: tuition, deadlines, rankings, requirements
- Examples: "rca学费", "csm ddl", "ual排名多少"

### open_info (25 questions)
Overview/general questions about programs/schools
- Examples: "皇艺纯艺怎么样", "gsapp建筑项目好吗", "parsons怎么样啊"

### recommendation (25 questions)
Decision support, "should I apply", comparisons
- Examples: "我能申rca吗", "皇艺和csm选哪个", "我这背景申parsons有戏吗"

### boundary (15 questions)
Questions the chatbot CANNOT answer (test "I don't know" behavior)
- Examples: "帮我写作品集", "能帮我申请吗", "你觉得我画的怎么样"
- Examples: "MIT 建筑怎么样" (not in knowledge base)
- Examples: "明年学费会涨吗" (future prediction)

### multi_turn (10 questions, 2-3 turns each)
Conversations with context dependency
- Turn 1: Establish context
- Turn 2+: Use pronouns, omit subjects, refer back
- Example:
  User: "我想申皇艺纯艺"
  Bot: "好的，皇艺 Fine Art MA..."
  User: "那作品集要几个项目" ← depends on previous context

## Output Format

Generate questions as JSON objects, one per line:

Single-turn:
{"id":"Q001","turns":1,"question":"皇艺纯艺研究生一年要多少钱啊","intent_expected":"hard_data","note":"Colloquial, mixed language"}

Multi-turn:
{"id":"M001","turns":2,"history":[{"role":"user","content":"我想申皇艺纯艺"},{"role":"assistant","content":"好的，皇艺 Fine Art MA 是..."}],"question":"那作品集要几个项目","intent_expected":"hard_data","note":"Pronoun reference"}

## Your Task

Generate 100 candidate questions following the distribution above. Prioritize:
1. **Realism** over coverage
2. **Variety** in phrasing styles
3. **Edge cases** that might break the system

Start generating now (output only JSON, no explanations):`;

async function generateCandidates(): Promise<QuestionCandidate[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('Missing DEEPSEEK_API_KEY environment variable');
  }

  console.log('🤖 Calling DeepSeek-V3 to generate question candidates...\n');

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: GENERATION_PROMPT },
      ],
      temperature: 0.8, // Higher temperature for variety
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();

  // Parse JSONL output
  const candidates: QuestionCandidate[] = [];
  const lines = content.split('\n').filter((line: string) => line.trim());

  for (const line of lines) {
    try {
      // Skip markdown code blocks if present
      if (line.startsWith('```') || line.startsWith('#')) {
        continue;
      }
      const candidate = JSON.parse(line);
      candidates.push(candidate);
    } catch (error) {
      console.warn(`⚠️  Skipped invalid JSON: ${line.substring(0, 50)}...`);
    }
  }

  return candidates;
}

async function saveCandidates(candidates: QuestionCandidate[]): Promise<void> {
  const content = candidates.map((c) => JSON.stringify(c)).join('\n') + '\n';
  await fs.writeFile(CANDIDATES_PATH, content, 'utf-8');
}

async function main() {
  console.log('🚀 Question Candidate Generator\n');
  console.log('Generating 100 real-world question candidates...\n');

  const candidates = await generateCandidates();

  console.log(`\n✅ Generated ${candidates.length} candidates\n`);

  // Show distribution
  const intentCounts = new Map<string, number>();
  const turnCounts = new Map<number, number>();

  for (const c of candidates) {
    intentCounts.set(c.intent_expected, (intentCounts.get(c.intent_expected) || 0) + 1);
    turnCounts.set(c.turns, (turnCounts.get(c.turns) || 0) + 1);
  }

  console.log('📊 Distribution:\n');
  console.log('By intent:');
  for (const [intent, count] of intentCounts.entries()) {
    console.log(`  ${intent}: ${count}`);
  }

  console.log('\nBy turns:');
  for (const [turns, count] of turnCounts.entries()) {
    console.log(`  ${turns}-turn: ${count}`);
  }

  await saveCandidates(candidates);

  console.log(`\n💾 Saved to: ${CANDIDATES_PATH}`);
  console.log('\n📝 Next steps:');
  console.log('1. Review candidates and select best 60 questions');
  console.log('2. Edit/rewrite questions to make them more realistic');
  console.log('3. Copy selected questions to eval/golden.jsonl');
  console.log('4. Run: npm run eval:validate');
  console.log('\n💡 Tip: Look for questions that test edge cases and real user patterns');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
