#!/usr/bin/env tsx
/**
 * Auto-fix golden.jsonl by finding best matching chunks in current database
 * 
 * For each question with ground truth chunk IDs that don't exist in DB,
 * this script searches for the most similar chunks and updates the IDs.
 * 
 * Usage:
 *   npm run eval:auto-fix-golden
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { searchKnowledge } from '../../lib/knowledge/retriever';
import { getSupabaseAdmin } from '../../lib/knowledge/supabase-admin';

config({ path: '.env.local' });

const GOLDEN_PATH = path.join(process.cwd(), 'eval', 'golden.jsonl');

interface GoldenItem {
  id: string;
  turns: number;
  question: string;
  intent_expected: string;
  must_cite_chunk_ids?: string[];
  skip_reason?: string;
  reference_answer?: string;
  history?: Array<{ role: string; content: string }>;
  note?: string;
}

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

async function checkChunksExist(chunkIds: string[]): Promise<Set<string>> {
  if (chunkIds.length === 0) return new Set();

  const supabase = getSupabaseAdmin() as any;
  const { data: chunks, error } = await supabase
    .from('document_chunks')
    .select('id')
    .in('id', chunkIds);

  if (error) {
    console.error('Error checking chunks:', error);
    return new Set();
  }

  return new Set((chunks || []).map((c: any) => c.id));
}

async function fixItem(item: GoldenItem): Promise<boolean> {
  if (!item.must_cite_chunk_ids || item.must_cite_chunk_ids.length === 0) {
    return false; // No chunks to fix
  }

  // Check if chunks exist
  const existingIds = await checkChunksExist(item.must_cite_chunk_ids);
  if (existingIds.size === item.must_cite_chunk_ids.length) {
    return false; // All chunks exist, no fix needed
  }

  console.log(`\n🔧 Fixing ${item.id}: ${item.question}`);
  console.log(`   Current IDs: ${item.must_cite_chunk_ids.join(', ')}`);

  // Search for best matching chunks
  const results = await searchKnowledge(item.question, {
    matchCount: 20,
    matchThreshold: 0.0, // Get all results
  });

  if (results.length === 0) {
    console.log('   ❌ No chunks found for this question');
    return false;
  }

  // Take top N chunks (same count as original)
  const newChunkIds = results
    .slice(0, item.must_cite_chunk_ids.length)
    .map((r) => r.chunkId);

  console.log(`   New IDs: ${newChunkIds.join(', ')}`);
  console.log(`   Top 3 similarities: ${results.slice(0, 3).map((r) => r.similarity.toFixed(3)).join(', ')}`);

  item.must_cite_chunk_ids = newChunkIds;
  return true;
}

async function main() {
  console.log('🔧 Auto-fix golden.jsonl\n');

  const items = await loadGolden();
  const testableItems = items.filter(
    (item) => item.must_cite_chunk_ids && item.must_cite_chunk_ids.length > 0
  );

  console.log(`Total items: ${items.length}`);
  console.log(`With ground truth: ${testableItems.length}`);

  let fixed = 0;
  for (const item of testableItems) {
    const wasFixed = await fixItem(item);
    if (wasFixed) fixed++;
  }

  console.log(`\n✅ Fixed ${fixed}/${testableItems.length} items`);

  if (fixed > 0) {
    await saveGolden(items);
    console.log(`📝 Saved to ${GOLDEN_PATH}`);
  }
}

main().catch(console.error);
