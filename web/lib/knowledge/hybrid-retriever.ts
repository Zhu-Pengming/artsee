/**
 * Hybrid Retrieval: Dense + Sparse Vector Fusion
 * 
 * Phase 2.5: Combine dense and sparse retrieval using RRF (Reciprocal Rank Fusion)
 * 
 * Why hybrid?
 * - Similarity analysis shows margin=0.022 < 0.05 (poor signal-to-noise ratio)
 * - 9/13 questions have margin < 0.05
 * - 3/13 questions have margin = 0.000 (cannot distinguish at all)
 * 
 * RRF Formula:
 * score(doc) = Σ 1 / (k + rank_i)
 * where k=60 (standard value), rank_i is the rank in each retrieval method
 */

import { createClient } from '@/lib/supabase/server';
import { generateEmbeddings } from './embedder';
import { generateSparseVector, computeSparseVectorSimilarity, SparseVector } from './sparse-embedder';

export interface HybridSearchOptions {
  schoolId?: string;
  matchThreshold?: number;
  matchCount?: number;
  useHybrid?: boolean; // Enable/disable hybrid retrieval
  rrfK?: number; // RRF parameter (default: 60)
}

export interface HybridRetrievedChunk {
  chunkId: string;
  documentId: string;
  schoolId: string;
  schoolName?: string;
  chunkText: string;
  headingPath: string;
  similarity: number;
  tokenCount: number;
  denseSimilarity?: number;
  sparseSimilarity?: number;
  rrfScore?: number;
}

const DEFAULT_RRF_K = 60;

/**
 * Hybrid search: Dense + Sparse vector retrieval with RRF fusion
 */
export async function hybridSearchKnowledge(
  query: string,
  options: HybridSearchOptions = {}
): Promise<HybridRetrievedChunk[]> {
  const {
    schoolId,
    matchThreshold = 0.4,
    matchCount = 5,
    useHybrid = true,
    rrfK = DEFAULT_RRF_K,
  } = options;

  const supabase = await createClient();

  // If hybrid is disabled, fall back to dense-only
  if (!useHybrid) {
    return denseOnlySearch(query, { schoolId, matchThreshold, matchCount });
  }

  // Step 1: Generate query embeddings (dense + sparse)
  const [[denseEmbedding], sparseEmbedding] = await Promise.all([
    generateEmbeddings([query]),
    generateSparseVector(query),
  ]);

  // Step 2: Dense retrieval
  const denseResults = await denseSearch(query, denseEmbedding, {
    schoolId,
    matchThreshold,
    matchCount: matchCount * 2, // Retrieve more for fusion
  });

  // Step 3: Sparse retrieval
  const sparseResults = await sparseSearch(sparseEmbedding, {
    schoolId,
    matchCount: matchCount * 2,
  });

  // Step 4: RRF Fusion
  const fusedResults = rrfFusion(denseResults, sparseResults, rrfK);

  // Step 5: Return top-k
  return fusedResults.slice(0, matchCount);
}

/**
 * Dense-only search (fallback)
 */
async function denseOnlySearch(
  query: string,
  options: { schoolId?: string; matchThreshold: number; matchCount: number }
): Promise<HybridRetrievedChunk[]> {
  const { schoolId, matchThreshold, matchCount } = options;
  const supabase = await createClient();

  const [embedding] = await generateEmbeddings([query]);

  let rpcQuery = supabase.rpc('match_document_chunks', {
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (schoolId) {
    rpcQuery = rpcQuery.eq('school_id', schoolId);
  }

  const { data, error } = await rpcQuery;

  if (error) {
    console.error('Dense search error:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    chunkId: row.id,
    documentId: row.document_id || '',
    schoolId: row.school_id || '',
    schoolName: row.school_name,
    chunkText: row.chunk_text,
    headingPath: row.heading_path,
    similarity: row.similarity,
    tokenCount: row.token_count || 0,
  }));
}

/**
 * Dense vector search
 */
async function denseSearch(
  query: string,
  embedding: number[],
  options: { schoolId?: string; matchThreshold: number; matchCount: number }
): Promise<Array<{ chunkId: string; rank: number; similarity: number; chunk: any }>> {
  const { schoolId, matchThreshold, matchCount } = options;
  const supabase = await createClient();

  let rpcQuery = supabase.rpc('match_document_chunks', {
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (schoolId) {
    rpcQuery = rpcQuery.eq('school_id', schoolId);
  }

  const { data, error } = await rpcQuery;

  if (error) {
    console.error('Dense search error:', error);
    return [];
  }

  return (data || []).map((row: any, index: number) => ({
    chunkId: row.id,
    rank: index + 1,
    similarity: row.similarity,
    chunk: row,
  }));
}

/**
 * Sparse vector search
 * 
 * Note: This requires sparse_vector column in database.
 * For now, we fetch all chunks and compute similarity in-memory.
 * TODO: Optimize with database-level sparse vector search.
 */
async function sparseSearch(
  queryVector: SparseVector,
  options: { schoolId?: string; matchCount: number }
): Promise<Array<{ chunkId: string; rank: number; similarity: number; chunk: any }>> {
  const { schoolId, matchCount } = options;
  const supabase = await createClient();

  // Fetch chunks with sparse vectors
  let query = supabase
    .from('document_chunks')
    .select('id, chunk_text, heading_path, sparse_vector, schools(name_en)')
    .not('sparse_vector', 'is', null)
    .limit(1000); // Limit for performance

  if (schoolId) {
    query = query.eq('school_id', schoolId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Sparse search error:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.warn('[hybrid] No chunks with sparse vectors found');
    return [];
  }

  // Compute sparse similarities
  const results = data
    .map((row: any) => {
      const chunkVector = row.sparse_vector as SparseVector;
      const similarity = computeSparseVectorSimilarity(queryVector, chunkVector);
      
      return {
        chunkId: row.id,
        similarity,
        chunk: {
          id: row.id,
          chunk_text: row.chunk_text,
          heading_path: row.heading_path,
          school_name: row.schools?.name_en,
        },
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, matchCount)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  return results;
}

/**
 * RRF (Reciprocal Rank Fusion)
 * 
 * Combines rankings from multiple retrieval methods.
 * Formula: score(doc) = Σ 1 / (k + rank_i)
 */
function rrfFusion(
  denseResults: Array<{ chunkId: string; rank: number; similarity: number; chunk: any }>,
  sparseResults: Array<{ chunkId: string; rank: number; similarity: number; chunk: any }>,
  k: number
): HybridRetrievedChunk[] {
  // Build score map
  const scoreMap = new Map<string, {
    rrfScore: number;
    denseSim?: number;
    sparseSim?: number;
    denseRank?: number;
    sparseRank?: number;
    chunk: any;
  }>();

  // Add dense scores
  for (const result of denseResults) {
    const score = 1 / (k + result.rank);
    scoreMap.set(result.chunkId, {
      rrfScore: score,
      denseSim: result.similarity,
      denseRank: result.rank,
      chunk: result.chunk,
    });
  }

  // Add sparse scores
  for (const result of sparseResults) {
    const score = 1 / (k + result.rank);
    const existing = scoreMap.get(result.chunkId);
    
    if (existing) {
      existing.rrfScore += score;
      existing.sparseSim = result.similarity;
      existing.sparseRank = result.rank;
    } else {
      scoreMap.set(result.chunkId, {
        rrfScore: score,
        sparseSim: result.similarity,
        sparseRank: result.rank,
        chunk: result.chunk,
      });
    }
  }

  // Sort by RRF score and convert to output format
  const fusedResults = Array.from(scoreMap.entries())
    .map(([chunkId, data]) => ({
      chunkId,
      documentId: data.chunk.document_id || '',
      schoolId: data.chunk.school_id || '',
      schoolName: data.chunk.school_name,
      chunkText: data.chunk.chunk_text,
      headingPath: data.chunk.heading_path,
      similarity: data.denseSim || data.sparseSim || 0, // Use dense sim as primary
      tokenCount: data.chunk.token_count || 0,
      denseSimilarity: data.denseSim,
      sparseSimilarity: data.sparseSim,
      rrfScore: data.rrfScore,
    }))
    .sort((a, b) => b.rrfScore - a.rrfScore);

  return fusedResults;
}
