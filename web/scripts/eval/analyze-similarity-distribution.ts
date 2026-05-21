#!/usr/bin/env tsx
/**
 * Analyze bge-m3 similarity distribution on golden set
 * 
 * Purpose: Determine if hybrid retrieval is needed based on signal-to-noise ratio
 * 
 * Outputs:
 * - must_cite chunk similarity distribution (p10/p50/p90)
 * - non-must_cite chunk similarity in top-5
 * - margin between must_cite and non-must_cite
 * 
 * Decision rule:
 * - margin < 0.05 → signal-to-noise poor, MUST enable hybrid retrieval
 * - margin > 0.1 → dense-only acceptable, hybrid can be delayed
 * 
 * Usage:
 *   npm run eval:analyze-similarity
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

// School name mappings
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

async function loadGolden(): Promise<GoldenItem[]> {
  const content = await fs.readFile(GOLDEN_PATH, 'utf-8');
  return content
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

async function analyzeQuestion(item: GoldenItem): Promise<{
  questionId: string;
  mustCiteSimilarities: number[];
  nonMustCiteSimilarities: number[];
  margin: number;
}> {
  if (!item.must_cite_chunk_ids || item.must_cite_chunk_ids.length === 0) {
    return {
      questionId: item.id,
      mustCiteSimilarities: [],
      nonMustCiteSimilarities: [],
      margin: 0,
    };
  }

  // Extract school and retrieve
  const schoolSlug = extractSchoolSlug(item.question);
  let schoolId: string | null = null;
  
  if (schoolSlug) {
    schoolId = await getSchoolId(schoolSlug);
  }

  const results = await searchKnowledge(item.question, {
    matchCount: 10,
    matchThreshold: 0.0,
    schoolId: schoolId || undefined,
  });

  const mustCiteIds = new Set(item.must_cite_chunk_ids);
  const mustCiteSimilarities: number[] = [];
  const nonMustCiteSimilarities: number[] = [];

  results.slice(0, 5).forEach((r) => {
    if (mustCiteIds.has(r.chunkId)) {
      mustCiteSimilarities.push(r.similarity);
    } else {
      nonMustCiteSimilarities.push(r.similarity);
    }
  });

  // Calculate margin: difference between min must_cite and max non_must_cite
  const minMustCite = mustCiteSimilarities.length > 0 
    ? Math.min(...mustCiteSimilarities) 
    : 0;
  const maxNonMustCite = nonMustCiteSimilarities.length > 0 
    ? Math.max(...nonMustCiteSimilarities) 
    : 0;
  const margin = minMustCite - maxNonMustCite;

  return {
    questionId: item.id,
    mustCiteSimilarities,
    nonMustCiteSimilarities,
    margin,
  };
}

async function main() {
  console.log('🔍 Analyzing bge-m3 Similarity Distribution\n');

  const items = await loadGolden();
  const testableItems = items.filter(
    (item) => item.must_cite_chunk_ids && item.must_cite_chunk_ids.length > 0
  );

  console.log(`Total questions: ${items.length}`);
  console.log(`With ground truth: ${testableItems.length}\n`);

  const allMustCiteSims: number[] = [];
  const allNonMustCiteSims: number[] = [];
  const margins: number[] = [];

  console.log('Analyzing each question...\n');

  for (const item of testableItems) {
    const result = await analyzeQuestion(item);
    
    allMustCiteSims.push(...result.mustCiteSimilarities);
    allNonMustCiteSims.push(...result.nonMustCiteSimilarities);
    margins.push(result.margin);

    console.log(`${result.questionId}:`);
    console.log(`  Must-cite sims: [${result.mustCiteSimilarities.map(s => s.toFixed(3)).join(', ')}]`);
    console.log(`  Non-must-cite sims: [${result.nonMustCiteSimilarities.map(s => s.toFixed(3)).join(', ')}]`);
    console.log(`  Margin: ${result.margin.toFixed(3)}`);
    console.log();
  }

  // Overall statistics
  console.log('================================================================================');
  console.log('📊 Overall Statistics\n');

  console.log('Must-cite chunk similarities:');
  console.log(`  p10: ${percentile(allMustCiteSims, 10).toFixed(3)}`);
  console.log(`  p50: ${percentile(allMustCiteSims, 50).toFixed(3)}`);
  console.log(`  p90: ${percentile(allMustCiteSims, 90).toFixed(3)}`);
  console.log(`  min: ${Math.min(...allMustCiteSims).toFixed(3)}`);
  console.log(`  max: ${Math.max(...allMustCiteSims).toFixed(3)}`);
  console.log();

  console.log('Non-must-cite chunk similarities (in top-5):');
  console.log(`  p10: ${percentile(allNonMustCiteSims, 10).toFixed(3)}`);
  console.log(`  p50: ${percentile(allNonMustCiteSims, 50).toFixed(3)}`);
  console.log(`  p90: ${percentile(allNonMustCiteSims, 90).toFixed(3)}`);
  console.log(`  min: ${Math.min(...allNonMustCiteSims).toFixed(3)}`);
  console.log(`  max: ${Math.max(...allNonMustCiteSims).toFixed(3)}`);
  console.log();

  console.log('Margins (must-cite min - non-must-cite max):');
  console.log(`  p10: ${percentile(margins, 10).toFixed(3)}`);
  console.log(`  p50: ${percentile(margins, 50).toFixed(3)}`);
  console.log(`  p90: ${percentile(margins, 90).toFixed(3)}`);
  console.log(`  avg: ${(margins.reduce((a, b) => a + b, 0) / margins.length).toFixed(3)}`);
  console.log();

  // Decision
  const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
  
  console.log('================================================================================');
  console.log('💡 Recommendation\n');

  if (avgMargin < 0.05) {
    console.log('⚠️  CRITICAL: Average margin < 0.05');
    console.log('    Signal-to-noise ratio is poor.');
    console.log('    **MUST enable hybrid retrieval (Phase 2.5)**');
    console.log('    Dense-only retrieval is insufficient for this corpus.');
  } else if (avgMargin < 0.1) {
    console.log('⚠️  WARNING: Average margin < 0.1');
    console.log('    Signal-to-noise ratio is marginal.');
    console.log('    **STRONGLY RECOMMEND hybrid retrieval (Phase 2.5)**');
    console.log('    Will significantly improve recall stability.');
  } else {
    console.log('✅ Average margin > 0.1');
    console.log('   Signal-to-noise ratio is acceptable.');
    console.log('   Dense-only retrieval can continue.');
    console.log('   Hybrid retrieval (Phase 2.5) can be delayed.');
  }

  console.log();
  console.log('================================================================================');
  console.log(`📁 Results saved to: ${path.join(process.cwd(), 'eval', 'similarity-analysis.json')}`);

  // Save detailed results
  await fs.writeFile(
    path.join(process.cwd(), 'eval', 'similarity-analysis.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      embedding_model: 'bge-m3 (Ollama)',
      threshold: 0.4,
      total_questions: testableItems.length,
      must_cite_similarities: {
        p10: percentile(allMustCiteSims, 10),
        p50: percentile(allMustCiteSims, 50),
        p90: percentile(allMustCiteSims, 90),
        min: Math.min(...allMustCiteSims),
        max: Math.max(...allMustCiteSims),
      },
      non_must_cite_similarities: {
        p10: percentile(allNonMustCiteSims, 10),
        p50: percentile(allNonMustCiteSims, 50),
        p90: percentile(allNonMustCiteSims, 90),
        min: Math.min(...allNonMustCiteSims),
        max: Math.max(...allNonMustCiteSims),
      },
      margins: {
        p10: percentile(margins, 10),
        p50: percentile(margins, 50),
        p90: percentile(margins, 90),
        avg: avgMargin,
      },
      recommendation: avgMargin < 0.05 
        ? 'MUST_ENABLE_HYBRID' 
        : avgMargin < 0.1 
        ? 'STRONGLY_RECOMMEND_HYBRID' 
        : 'DENSE_ONLY_ACCEPTABLE',
    }, null, 2)
  );
}

main().catch(console.error);
