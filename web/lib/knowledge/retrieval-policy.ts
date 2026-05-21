/**
 * Retrieval Policy - Intent-based search parameter configuration
 * 
 * Phase 3.1: Threshold calibration based on Phase 2 实测数据
 * 
 * Baseline (Phase 2 完成后):
 * - Margin avg: 0.060 (after overlap=120 + hybrid)
 * - Recall@5: 84.6% (11/13)
 * - Hard_data recall: 100% (8/8)
 * - Failed cases: Q016 (open_info), Q036 (recommendation)
 * 
 * Calibration strategy:
 * - Hard_data: Keep 0.4 (100% recall verified) + force hybrid
 * - Open_info: Lower to 0.33 (Q016 had 0 recalls at 0.4)
 * - Recommendation: Lower to 0.36 (Q036 involves multi-entity comparison)
 * - Threshold range: 0.33-0.40 (tighter than original 0.35-0.45 plan)
 */

import { IntentType } from '@/lib/ai/intent';

export interface SearchOptions {
  matchThreshold: number;
  matchCount: number;
  useHybrid: boolean;
}

/**
 * bge-m3 threshold calibration (based on Phase 2 实测: margin=0.060, recall@5=84.6%)
 * 
 * Phase 2 verification:
 * - hard_data at 0.4: 100% recall
 * - open_info at 0.4: 0 recall (Q016 failed)
 */
export const RETRIEVAL_POLICY: Record<IntentType, SearchOptions> = {
  // Hard data queries: tuition, deadline, ranking
  // Keep 0.4 threshold (verified 100% recall) + force hybrid for precision
  hard_data: {
    matchThreshold: 0.40,
    matchCount: 5,
    useHybrid: true,
  },

  // Open-ended info queries: school atmosphere, program features
  // Lower to 0.25 to fix Q016 (0 recall issue at 0.28)
  open_info: {
    matchThreshold: 0.25,
    matchCount: 8,
    useHybrid: false,
  },

  // Recommendation/comparison queries: "RCA vs UAL", "which school for me"
  // Lower to 0.25 to fix Q036 (multi-entity comparison, 0 recall at 0.30)
  recommendation: {
    matchThreshold: 0.25,
    matchCount: 6,
    useHybrid: false,
  },

  // Application advice: portfolio tips, timeline planning
  application_advice: {
    matchThreshold: 0.38,
    matchCount: 6,
    useHybrid: false,
  },

  // School fit analysis: "can I get in", "am I qualified"
  // Multi-hop retrieval needed, lower threshold for broader context
  school_fit_analysis: {
    matchThreshold: 0.35,
    matchCount: 8,
    useHybrid: false,
  },

  // Meta queries: "what can you do", "how to use"
  meta: {
    matchThreshold: 0.35,
    matchCount: 3,
    useHybrid: false,
  },
};

/**
 * Get search options for a given intent
 */
export function getRetrievalPolicy(intent: IntentType): SearchOptions {
  return RETRIEVAL_POLICY[intent];
}

/**
 * Get average similarity threshold across all intents (for debugging)
 */
export function getAverageThreshold(): number {
  const thresholds = Object.values(RETRIEVAL_POLICY).map(p => p.matchThreshold);
  return thresholds.reduce((sum, t) => sum + t, 0) / thresholds.length;
}
