#!/usr/bin/env tsx
/**
 * Smart fix golden.jsonl by matching school names
 * 
 * Extracts school names from questions and only searches within those schools' chunks.
 * 
 * Usage:
 *   npm run eval:smart-fix-golden
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { getSupabaseAdmin } from '../../lib/knowledge/supabase-admin';
import { generateEmbeddings } from '../../lib/knowledge/embedder';

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

// School name mappings (abbreviations -> slug)
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
    console.log(`   ⚠️  School not found: ${schoolSlug}`);
    return null;
  }

  return data.id;
}

async function searchChunksInSchool(
  question: string,
  schoolId: string,
  limit: number = 20
): Promise<Array<{ chunkId: string; similarity: number; text: string }>> {
  const [queryEmbedding] = await generateEmbeddings([question]);
  const supabase = getSupabaseAdmin() as any;

  const { data, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.0,
    match_count: limit,
    filter_school_id: schoolId,
  });

  if (error) {
    console.error('   ❌ Search error:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    chunkId: row.chunk_id,
    similarity: row.similarity,
    text: row.chunk_text.substring(0, 100),
  }));
}

async function fixItem(item: GoldenItem): Promise<boolean> {
  if (!item.must_cite_chunk_ids || item.must_cite_chunk_ids.length === 0) {
    return false;
  }

  console.log(`\n🔧 ${item.id}: ${item.question}`);

  // Extract school from question
  const schoolSlug = extractSchoolSlug(item.question);
  if (!schoolSlug) {
    console.log('   ⚠️  No school detected in question, skipping');
    return false;
  }

  console.log(`   🏫 Detected school: ${schoolSlug}`);

  // Get school ID
  const schoolId = await getSchoolId(schoolSlug);
  if (!schoolId) {
    return false;
  }

  // Search within this school
  const results = await searchChunksInSchool(
    item.question,
    schoolId,
    20
  );

  if (results.length === 0) {
    console.log('   ❌ No chunks found in this school');
    return false;
  }

  // Take top N chunks
  const newChunkIds = results
    .slice(0, item.must_cite_chunk_ids.length)
    .map((r) => r.chunkId);

  console.log(`   Old IDs: ${item.must_cite_chunk_ids.join(', ')}`);
  console.log(`   New IDs: ${newChunkIds.join(', ')}`);
  console.log(`   Top 3 similarities: ${results.slice(0, 3).map((r) => r.similarity.toFixed(3)).join(', ')}`);
  console.log(`   Preview: ${results[0].text}...`);

  item.must_cite_chunk_ids = newChunkIds;
  return true;
}

async function main() {
  console.log('🧠 Smart fix golden.jsonl (with school matching)\n');

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
