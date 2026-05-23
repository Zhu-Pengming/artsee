#!/usr/bin/env tsx
/**
 * AI-powered reference answer drafter for golden.jsonl
 * 
 * Usage:
 *   npm run eval:draft-answers
 * 
 * For each question with must_cite_chunk_ids but no reference_answer:
 * 1. Fetches chunk content from DB
 * 2. Calls DeepSeek-V3 with strict "only use provided chunks" prompt
 * 3. Writes reference_answer back to golden.jsonl
 * 
 * You should REVIEW the drafts, not blindly accept them.
 * If a draft is wrong, fix must_cite_chunk_ids (ground truth was wrong).
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { getSupabaseAdmin } from '../../lib/knowledge/supabase-admin';

// Load .env.local
config({ path: path.join(process.cwd(), '.env.local') });

interface GoldenItem {
  id: string;
  turns: number;
  question: string;
  intent_expected: string;
  must_cite_chunk_ids?: string[];
  reference_answer?: string;
  must_not_say?: string[];
  history?: Array<{ role: string; content: string }>;
}

const GOLDEN_PATH = path.join(process.cwd(), 'eval', 'golden.jsonl');
const PROMPT_PATH = path.join(process.cwd(), 'lib', 'knowledge', 'prompts', 'eval.draft-reference.v1.md');

async function loadGolden(): Promise<GoldenItem[]> {
  const content = await fs.readFile(GOLDEN_PATH, 'utf-8');
  return content
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

async function saveGolden(items: GoldenItem[]): Promise<void> {
  const content = items.map((item) => JSON.stringify(item)).join('\n') + '\n';
  await fs.writeFile(GOLDEN_PATH, content, 'utf-8');
}

async function loadPromptTemplate(): Promise<string> {
  try {
    return await fs.readFile(PROMPT_PATH, 'utf-8');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('⚠️  Prompt template not found, creating default...');
      const defaultPrompt = `You are a reference answer drafter for evaluation datasets.

**STRICT RULES:**
1. ONLY use information from the provided chunks below
2. DO NOT use your training knowledge
3. If chunks don't contain enough info, say "无法从提供的内容中回答"
4. Keep answers concise and factual
5. Use the same language as the question (Chinese/English)

**Chunks:**
{{CHUNKS}}

**Question:**
{{QUESTION}}

**Your reference answer (based ONLY on chunks above):**`;
      
      await fs.mkdir(path.dirname(PROMPT_PATH), { recursive: true });
      await fs.writeFile(PROMPT_PATH, defaultPrompt, 'utf-8');
      return defaultPrompt;
    }
    throw error;
  }
}

async function fetchChunks(chunkIds: string[]): Promise<Array<{ id: string; text: string; path: string }>> {
  const supabase = getSupabaseAdmin();
  
  const { data: chunks, error } = await supabase
    .from('document_chunks')
    .select('id, chunk_text, heading_path')
    .in('id', chunkIds);

  if (error) {
    throw new Error(`Failed to fetch chunks: ${error.message}`);
  }

  if (!chunks || chunks.length === 0) {
    throw new Error(`No chunks found for IDs: ${chunkIds.join(', ')}`);
  }

  return chunks.map((c: any) => ({
    id: c.id,
    text: c.chunk_text,
    path: c.heading_path || '(root)',
  }));
}

async function draftAnswer(question: string, chunks: Array<{ id: string; text: string; path: string }>): Promise<string> {
  const promptTemplate = await loadPromptTemplate();
  
  const chunksText = chunks
    .map((c, idx) => `[Chunk ${idx + 1}] (${c.path})\n${c.text}`)
    .join('\n\n---\n\n');

  const prompt = promptTemplate
    .replace('{{CHUNKS}}', chunksText)
    .replace('{{QUESTION}}', question);

  // Call DeepSeek-V3 API
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('Missing DEEPSEEK_API_KEY environment variable');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.1, // Low temperature for factual answers
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function main() {
  console.log('🚀 Reference Answer Drafter\n');

  const items = await loadGolden();
  
  const needDraft = items.filter(
    (item) =>
      item.must_cite_chunk_ids &&
      item.must_cite_chunk_ids.length > 0 &&
      (!item.reference_answer || item.reference_answer.trim() === '')
  );

  console.log(`Total questions: ${items.length}`);
  console.log(`Already have reference answers: ${items.length - needDraft.length}`);
  console.log(`Need drafting: ${needDraft.length}\n`);

  if (needDraft.length === 0) {
    console.log('✅ All questions already have reference answers!');
    return;
  }

  let drafted = 0;
  let failed = 0;

  for (const item of needDraft) {
    console.log(`\n📝 Drafting: ${item.id}`);
    console.log(`   Question: ${item.question}`);

    try {
      const chunks = await fetchChunks(item.must_cite_chunk_ids!);
      console.log(`   Fetched ${chunks.length} chunks`);

      const answer = await draftAnswer(item.question, chunks);
      item.reference_answer = answer;

      console.log(`   ✅ Draft: ${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}`);
      
      drafted++;
      await saveGolden(items);
      console.log('   💾 Saved');

      // Rate limit: wait 1 second between API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✅ Drafted: ${drafted}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Saved to: ${GOLDEN_PATH}`);
  console.log('\n⚠️  IMPORTANT: Review all drafts before using them!');
  console.log('   If a draft is wrong, fix must_cite_chunk_ids (ground truth issue).');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
