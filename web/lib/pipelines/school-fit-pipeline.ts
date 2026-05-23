/**
 * School Fit Analysis Pipeline
 * 
 * Phase 4.2: Multi-hop retrieval + RRF fusion
 * 
 * 用于 school_fit_analysis 意图，执行多步检索并合并结果
 */

import { searchKnowledge, type RetrievedChunk } from '@/lib/knowledge/retriever';
import type { UserProfile } from '@/lib/knowledge/profile-formatter';
import { getSupabaseAdmin } from '@/lib/knowledge/supabase-admin';

export interface RetrievalStep {
  query: string;
  k: number;
  description?: string;
}

export interface FitAnalysisResult {
  chunks: RetrievedChunk[];
  plan: RetrievalStep[];
  totalRetrieved: number;
}

/**
 * Convert school slug to UUID
 */
async function getSchoolIdFromSlug(slug: string): Promise<string | null> {
  const supabase = getSupabaseAdmin() as any;
  const { data, error } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', slug)
    .single();
  
  if (error || !data) {
    console.error(`[school-fit] School not found for slug: ${slug}`);
    return null;
  }
  
  return data.id;
}

/**
 * RRF (Reciprocal Rank Fusion) merge
 * 
 * Formula: score(chunk) = Σ 1 / (k + rank_i)
 * k = 60 (经验值，对召回数量不敏感)
 */
function rrfMerge(
  resultsPerStep: RetrievedChunk[][],
  k: number = 60
): RetrievedChunk[] {
  const chunkScores = new Map<string, { chunk: RetrievedChunk; score: number }>();
  
  for (const results of resultsPerStep) {
    results.forEach((chunk, rank) => {
      const chunkId = chunk.chunkId;
      const rrfScore = 1 / (k + rank + 1); // rank is 0-indexed
      
      if (chunkScores.has(chunkId)) {
        // Accumulate score for chunks that appear in multiple steps
        const existing = chunkScores.get(chunkId)!;
        existing.score += rrfScore;
      } else {
        chunkScores.set(chunkId, { chunk, score: rrfScore });
      }
    });
  }
  
  // Sort by RRF score (descending)
  const merged = Array.from(chunkScores.values())
    .sort((a, b) => b.score - a.score)
    .map(item => item.chunk);
  
  return merged;
}

/**
 * Build retrieval plan for school fit analysis
 */
function buildRetrievalPlan(
  query: string,
  schoolSlug: string | undefined,
  userProfile: UserProfile | null
): RetrievalStep[] {
  const plan: RetrievalStep[] = [];
  
  // Step 1: School positioning and admission standards
  if (schoolSlug) {
    plan.push({
      query: `${schoolSlug} 定位 学生画像 录取标准 要求`,
      k: 3,
      description: 'School positioning and admission standards',
    });
  }
  
  // Step 2: Portfolio and application requirements
  if (schoolSlug) {
    plan.push({
      query: `${schoolSlug} 申请要求 作品集 风格`,
      k: 3,
      description: 'Portfolio and application requirements',
    });
  }
  
  // Step 3: User profile match (if available)
  if (userProfile?.portfolio_style_tendency && userProfile.portfolio_style_tendency.length > 0) {
    const styles = userProfile.portfolio_style_tendency.join(' ');
    const styleQuery = schoolSlug
      ? `${styles} 风格 适配 ${schoolSlug}`
      : `${styles} 风格 适合 学校`;
    
    plan.push({
      query: styleQuery,
      k: 2,
      description: 'User portfolio style match',
    });
  }
  
  // Fallback: if no school-specific queries, use original query
  if (plan.length === 0) {
    plan.push({
      query,
      k: 5,
      description: 'Original query fallback',
    });
  }
  
  return plan;
}

/**
 * Execute school fit analysis with multi-hop retrieval
 */
export async function runSchoolFitAnalysis(
  query: string,
  schoolSlug: string | undefined,
  userProfile: UserProfile | null,
  options: {
    matchThreshold?: number;
    topK?: number;
  } = {}
): Promise<FitAnalysisResult> {
  const { matchThreshold = 0.35, topK = 5 } = options;
  
  // Convert slug to UUID if provided
  let schoolId: string | undefined;
  if (schoolSlug) {
    const id = await getSchoolIdFromSlug(schoolSlug);
    if (id) {
      schoolId = id;
    } else {
      console.warn(`[school-fit] Could not find school ID for slug: ${schoolSlug}`);
    }
  }
  
  // Build retrieval plan
  const plan = buildRetrievalPlan(query, schoolSlug, userProfile);
  
  console.log('[school-fit] Retrieval plan:', plan.map(p => p.description).join(' → '));
  
  // Execute retrieval for each step
  const resultsPerStep = await Promise.all(
    plan.map(async (step) => {
      console.log(`[school-fit] Executing step: ${step.description}`);
      const results = await searchKnowledge(step.query, {
        matchThreshold,
        matchCount: step.k,
        schoolId,
      });
      console.log(`[school-fit] Retrieved ${results.length} chunks for: ${step.description}`);
      return results;
    })
  );
  
  // RRF fusion
  const mergedChunks = rrfMerge(resultsPerStep);
  
  console.log(`[school-fit] Total unique chunks after RRF: ${mergedChunks.length}`);
  
  // Top-K for prompt (avoid information dilution)
  const topChunks = mergedChunks.slice(0, topK);
  
  const totalRetrieved = resultsPerStep.reduce((sum, results) => sum + results.length, 0);
  
  return {
    chunks: topChunks,
    plan,
    totalRetrieved,
  };
}

/**
 * Format fit analysis result for logging
 */
export function formatFitAnalysisLog(result: FitAnalysisResult): string {
  const planSummary = result.plan
    .map((step, i) => `  ${i + 1}. ${step.description} (k=${step.k})`)
    .join('\n');
  
  const chunkSummary = result.chunks
    .slice(0, 3)
    .map((chunk, i) => `  ${i + 1}. ${chunk.headingPath} (sim: ${chunk.similarity.toFixed(3)})`)
    .join('\n');
  
  return `
School Fit Analysis Result:
Plan:
${planSummary}
Total retrieved: ${result.totalRetrieved}
Top chunks (${result.chunks.length}):
${chunkSummary}
`;
}
