#!/usr/bin/env tsx
/**
 * Recall Evaluation Script
 * 
 * Tests whether the retriever can recall ground truth chunks.
 * 
 * Metrics:
 * - Recall@5: % of questions where any ground truth chunk appears in top 5
 * - Recall@10: % of questions where any ground truth chunk appears in top 10
 * - MRR (Mean Reciprocal Rank): Average of 1/rank for first ground truth chunk
 * 
 * Usage:
 *   npm run eval:recall
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { searchKnowledge } from '../../lib/knowledge/retriever';
import { hybridSearchKnowledge } from '../../lib/knowledge/hybrid-retriever';
import { getSupabaseAdmin } from '../../lib/knowledge/supabase-admin';
import { classifyIntent } from '../../lib/ai/intent';
import { getRetrievalPolicy } from '../../lib/knowledge/retrieval-policy';

config({ path: '.env.local' });

// School name mappings (same as smart-fix-golden)
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

interface GoldenItem {
  id: string;
  turns: number;
  question: string;
  intent_expected: string;
  must_cite_chunk_ids?: string[];
  history?: Array<{ role: string; content: string }>;
  note?: string;
  skip_reason?: string;
}

interface RecallResult {
  question_id: string;
  question: string;
  ground_truth_ids: string[];
  retrieved_ids: string[];
  recall_at_5: boolean;
  recall_at_10: boolean;
  mrr: number;
  first_hit_rank: number | null;
}

async function loadGolden(): Promise<GoldenItem[]> {
  const content = await fs.readFile(GOLDEN_PATH, 'utf-8');
  return content
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

async function evaluateRecall(
  item: GoldenItem,
  useSchoolFilter: boolean = true
): Promise<RecallResult | null> {
  if (!item.must_cite_chunk_ids || item.must_cite_chunk_ids.length === 0) {
    return null;
  }

  console.log(`\n📝 ${item.id}: ${item.question}`);
  console.log(`   Ground truth: ${item.must_cite_chunk_ids.length} chunk(s)`);

  // Extract school from question
  const schoolSlug = extractSchoolSlug(item.question);
  let schoolId: string | null = null;
  
  if (schoolSlug) {
    schoolId = await getSchoolId(schoolSlug);
    if (schoolId) {
      console.log(`   🏫 School filter: ${schoolSlug}`);
    }
  }

  // Phase 3: Use intent-based retrieval policy
  const intentResult = classifyIntent(item.question);
  const policy = getRetrievalPolicy(intentResult.intent);
  
  console.log(`   Intent: ${intentResult.intent} (confidence: ${intentResult.confidence.toFixed(2)})`);
  console.log(`   Policy: threshold=${policy.matchThreshold}, count=${policy.matchCount}, hybrid=${policy.useHybrid}`);

  // Search with intent-specific parameters
  // Note: For now, use searchKnowledge for all (hybrid requires server context)
  // TODO: Implement hybrid search in eval context
  const results = await searchKnowledge(item.question, {
    matchCount: 10,
    matchThreshold: policy.matchThreshold,
    schoolId: schoolId || undefined,
  });

  const retrievedIds = results.map((r) => r.chunkId);
  const groundTruthIds = item.must_cite_chunk_ids;

  // Calculate recall@5
  const top5Ids = retrievedIds.slice(0, 5);
  const recallAt5 = groundTruthIds.some((id) => top5Ids.includes(id));

  // Calculate recall@10
  const top10Ids = retrievedIds.slice(0, 10);
  const recallAt10 = groundTruthIds.some((id) => top10Ids.includes(id));

  // Calculate MRR
  let firstHitRank: number | null = null;
  for (let i = 0; i < retrievedIds.length; i++) {
    if (groundTruthIds.includes(retrievedIds[i])) {
      firstHitRank = i + 1; // 1-indexed
      break;
    }
  }
  const mrr = firstHitRank ? 1 / firstHitRank : 0;

  console.log(`   Retrieved: ${retrievedIds.length} chunks`);
  console.log(`   Recall@5: ${recallAt5 ? '✅' : '❌'}`);
  console.log(`   Recall@10: ${recallAt10 ? '✅' : '❌'}`);
  console.log(`   First hit rank: ${firstHitRank || 'N/A'}`);

  // Show top 3 retrieved chunks with similarity scores for debugging
  if (results.length > 0 && !recallAt5) {
    console.log(`   Top 3 retrieved (with similarity):`);
    results.slice(0, 3).forEach((r, i) => {
      const isGroundTruth = groundTruthIds.includes(r.chunkId);
      const marker = isGroundTruth ? '✅ GT' : '';
      console.log(
        `     [${i + 1}] ${r.similarity.toFixed(3)} - ${r.headingPath.split(' > ').pop()?.substring(0, 40)}... ${marker}`
      );
    });
  }

  return {
    question_id: item.id,
    question: item.question,
    ground_truth_ids: groundTruthIds,
    retrieved_ids: retrievedIds,
    recall_at_5: recallAt5,
    recall_at_10: recallAt10,
    mrr,
    first_hit_rank: firstHitRank,
  };
}

async function main() {
  console.log('🔍 Recall Evaluation\n');

  const items = await loadGolden();
  const testableItems = items.filter(
    (item) => item.must_cite_chunk_ids && item.must_cite_chunk_ids.length > 0
  );

  console.log(`Total questions: ${items.length}`);
  console.log(`With ground truth: ${testableItems.length}\n`);

  if (testableItems.length === 0) {
    console.log('❌ No questions with ground truth chunks to evaluate');
    process.exit(1);
  }

  const results: RecallResult[] = [];

  for (const item of testableItems) {
    const result = await evaluateRecall(item);
    if (result) {
      results.push(result);
    }
  }

  // Calculate aggregate metrics
  const recallAt5Count = results.filter((r) => r.recall_at_5).length;
  const recallAt10Count = results.filter((r) => r.recall_at_10).length;
  const avgMrr = results.reduce((sum, r) => sum + r.mrr, 0) / results.length;

  const recallAt5Pct = (recallAt5Count / results.length) * 100;
  const recallAt10Pct = (recallAt10Count / results.length) * 100;

  console.log('\n' + '='.repeat(80));
  console.log('📊 Summary\n');
  console.log(`Total evaluated: ${results.length}`);
  console.log(`Recall@5: ${recallAt5Count}/${results.length} (${recallAt5Pct.toFixed(1)}%)`);
  console.log(`Recall@10: ${recallAt10Count}/${results.length} (${recallAt10Pct.toFixed(1)}%)`);
  console.log(`MRR: ${avgMrr.toFixed(3)}`);

  // Show failures
  const failuresAt10 = results.filter((r) => !r.recall_at_10);
  if (failuresAt10.length > 0) {
    console.log('\n❌ Failed to recall (top 10):\n');
    for (const failure of failuresAt10) {
      console.log(`   ${failure.question_id}: ${failure.question}`);
      console.log(`   Ground truth: ${failure.ground_truth_ids.join(', ')}`);
      console.log(`   Retrieved: ${failure.retrieved_ids.slice(0, 3).join(', ')}...`);
      console.log('');
    }
  }

  // Save detailed results
  const outputPath = path.join(process.cwd(), 'eval', 'recall-results.json');
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        summary: {
          total: results.length,
          recall_at_5: recallAt5Pct,
          recall_at_10: recallAt10Pct,
          mrr: avgMrr,
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
