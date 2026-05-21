#!/usr/bin/env tsx
/**
 * Diagnose Recall Issues
 * 
 * This script helps diagnose why recall is so low by:
 * 1. Checking if ground truth chunks exist in the database
 * 2. Computing similarity between questions and ground truth chunks
 * 3. Comparing with top retrieved chunks
 * 
 * Usage:
 *   npm run eval:diagnose
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
  question: string;
  must_cite_chunk_ids?: string[];
}

async function loadGolden(): Promise<GoldenItem[]> {
  const content = await fs.readFile(GOLDEN_PATH, 'utf-8');
  return content
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function diagnoseQuestion(item: GoldenItem) {
  if (!item.must_cite_chunk_ids || item.must_cite_chunk_ids.length === 0) {
    return;
  }

  console.log('\n' + '='.repeat(80));
  console.log(`📝 ${item.id}: ${item.question}`);
  console.log(`Ground truth chunks: ${item.must_cite_chunk_ids.length}`);

  const supabase = getSupabaseAdmin() as any;

  // 1. Check if ground truth chunks exist
  console.log('\n1️⃣ Checking if ground truth chunks exist in database...');
  const { data: gtChunks, error: gtError } = await supabase
    .from('document_chunks')
    .select('id, chunk_text, heading_path, embedding')
    .in('id', item.must_cite_chunk_ids);

  if (gtError) {
    console.error('   ❌ Error fetching ground truth chunks:', gtError);
    return;
  }

  if (!gtChunks || gtChunks.length === 0) {
    console.log('   ❌ No ground truth chunks found in database!');
    console.log(`   Expected IDs: ${item.must_cite_chunk_ids.join(', ')}`);
    return;
  }

  console.log(`   ✅ Found ${gtChunks.length}/${item.must_cite_chunk_ids.length} chunks`);

  if (gtChunks.length < item.must_cite_chunk_ids.length) {
    const foundIds = gtChunks.map((c: any) => c.id);
    const missingIds = item.must_cite_chunk_ids.filter((id) => !foundIds.includes(id));
    console.log(`   ⚠️  Missing chunks: ${missingIds.join(', ')}`);
  }

  // 2. Compute similarity between question and ground truth chunks
  console.log('\n2️⃣ Computing similarity between question and ground truth chunks...');
  const [questionEmbedding] = await generateEmbeddings([item.question]);

  console.log(`   Question embedding: ${Array.isArray(questionEmbedding) ? `Array[${questionEmbedding.length}]` : typeof questionEmbedding}`);
  if (Array.isArray(questionEmbedding)) {
    console.log(`   First 3 values: [${questionEmbedding.slice(0, 3).join(', ')}...]`);
  }

  for (const chunk of gtChunks) {
    let chunkEmbedding = chunk.embedding;
    const path = chunk.heading_path.split(' > ').pop() || '(root)';

    console.log(`   Chunk: ${path.substring(0, 50)}`);
    
    // Parse embedding if it's a string (Supabase returns vector as string)
    if (typeof chunkEmbedding === 'string') {
      // Remove brackets and parse as array
      const cleaned = chunkEmbedding.replace(/^\[|\]$/g, '');
      chunkEmbedding = cleaned.split(',').map((v) => parseFloat(v.trim()));
    }
    
    console.log(`   Chunk embedding: ${Array.isArray(chunkEmbedding) ? `Array[${chunkEmbedding.length}]` : typeof chunkEmbedding}`);
    
    if (Array.isArray(chunkEmbedding) && chunkEmbedding.length > 0) {
      console.log(`   First 3 values: [${chunkEmbedding.slice(0, 3).join(', ')}...]`);
      const similarity = cosineSimilarity(questionEmbedding, chunkEmbedding);
      console.log(`   Similarity: ${similarity.toFixed(4)}`);
    } else {
      console.log(`   ❌ Invalid embedding data!`);
    }
    
    console.log(`   Text preview: ${chunk.chunk_text.substring(0, 100).replace(/\n/g, ' ')}...`);
    console.log('');
  }

  // 3. Get top 10 retrieved chunks and compare
  console.log('3️⃣ Comparing with top 10 retrieved chunks...');
  const { data: topChunks, error: topError } = await supabase.rpc(
    'match_document_chunks',
    {
      query_embedding: questionEmbedding,
      match_threshold: 0.0,
      match_count: 10,
      filter_school_id: null,
    }
  );

  if (topError) {
    console.error('   ❌ Error retrieving top chunks:', topError);
    return;
  }

  console.log(`   Retrieved ${topChunks?.length || 0} chunks`);
  console.log('   Top 5:');

  topChunks?.slice(0, 5).forEach((chunk: any, i: number) => {
    const isGroundTruth = item.must_cite_chunk_ids!.includes(chunk.chunk_id);
    const marker = isGroundTruth ? '✅ GROUND TRUTH' : '';
    const path = chunk.heading_path.split(' > ').pop() || '(root)';

    console.log(`   [${i + 1}] Similarity: ${chunk.similarity.toFixed(4)} ${marker}`);
    console.log(`       Path: ${path.substring(0, 60)}`);
    console.log(`       Preview: ${chunk.chunk_text.substring(0, 80).replace(/\n/g, ' ')}...`);
    console.log('');
  });

  // 4. Check if ground truth chunks appear anywhere in top 10
  const topChunkIds = topChunks?.map((c: any) => c.chunk_id) || [];
  const gtInTop10 = item.must_cite_chunk_ids.filter((id) => topChunkIds.includes(id));

  if (gtInTop10.length > 0) {
    console.log(`   ✅ Found ${gtInTop10.length} ground truth chunk(s) in top 10`);
    gtInTop10.forEach((id) => {
      const rank = topChunkIds.indexOf(id) + 1;
      console.log(`      - Rank ${rank}: ${id}`);
    });
  } else {
    console.log('   ❌ No ground truth chunks in top 10');
  }
}

async function main() {
  console.log('🔍 Recall Diagnosis Tool\n');

  const items = await loadGolden();
  const testableItems = items.filter(
    (item) => item.must_cite_chunk_ids && item.must_cite_chunk_ids.length > 0
  );

  console.log(`Total questions: ${items.length}`);
  console.log(`With ground truth: ${testableItems.length}`);

  // Diagnose first 3 questions in detail
  const sampleSize = Math.min(3, testableItems.length);
  console.log(`\nDiagnosing first ${sampleSize} questions in detail...\n`);

  for (let i = 0; i < sampleSize; i++) {
    await diagnoseQuestion(testableItems[i]);
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 Diagnosis complete');
  console.log('\nTo diagnose all questions, modify the sampleSize in the script.');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
