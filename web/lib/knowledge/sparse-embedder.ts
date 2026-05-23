/**
 * Sparse Vector Generation for Hybrid Retrieval
 * 
 * Phase 2.5: Generate sparse vectors using BGE-M3 for lexical matching
 * 
 * Sparse vectors complement dense vectors by capturing:
 * - Exact keyword matches
 * - Rare terms (e.g., specific school names, program names)
 * - Numbers and dates (critical for hard_data queries)
 */

export interface SparseVector {
  indices: number[];
  values: number[];
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'bge-m3';

/**
 * Generate sparse vector using BGE-M3
 * 
 * Note: This is a placeholder implementation. BGE-M3 supports sparse vectors,
 * but Ollama's API may not expose them directly. We have two options:
 * 
 * 1. Use Ollama with custom endpoint (if available)
 * 2. Use local BGE-M3 Python script via child_process
 * 3. Fallback: Simple TF-IDF based sparse vector
 * 
 * For now, we implement option 3 (TF-IDF fallback) to unblock development.
 * TODO: Replace with actual BGE-M3 sparse vector when API is available.
 */
export async function generateSparseVector(text: string): Promise<SparseVector> {
  // Fallback: Simple TF-IDF based sparse vector
  return generateTfIdfSparseVector(text);
}

/**
 * Fallback: Generate TF-IDF based sparse vector
 * 
 * This is a simplified implementation for development.
 * In production, use BGE-M3's native sparse vector generation.
 */
function generateTfIdfSparseVector(text: string): SparseVector {
  // Tokenize (simple whitespace + punctuation split)
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ') // Keep alphanumeric + Chinese
    .split(/\s+/)
    .filter(t => t.length > 1); // Remove single chars

  // Count term frequencies
  const termFreq: Map<string, number> = new Map();
  for (const token of tokens) {
    termFreq.set(token, (termFreq.get(token) || 0) + 1);
  }

  // Convert to sparse vector format
  // Use simple hash function for token IDs (in production, use proper vocabulary)
  const indices: number[] = [];
  const values: number[] = [];

  for (const [term, freq] of termFreq.entries()) {
    const tokenId = simpleHash(term);
    const tfIdf = freq / tokens.length; // Simplified TF-IDF (no IDF component)
    
    indices.push(tokenId);
    values.push(tfIdf);
  }

  // Sort by token ID for consistency
  const sorted = indices
    .map((id, i) => ({ id, value: values[i] }))
    .sort((a, b) => a.id - b.id);

  return {
    indices: sorted.map(x => x.id),
    values: sorted.map(x => x.value),
  };
}

/**
 * Simple hash function for token IDs
 * 
 * In production, use a proper vocabulary mapping.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100000; // Limit to reasonable range
}

/**
 * Compute sparse vector similarity (dot product)
 */
export function computeSparseVectorSimilarity(
  vec1: SparseVector,
  vec2: SparseVector
): number {
  // Build index map for vec2
  const vec2Map = new Map<number, number>();
  for (let i = 0; i < vec2.indices.length; i++) {
    vec2Map.set(vec2.indices[i], vec2.values[i]);
  }

  // Compute dot product
  let dotProduct = 0;
  for (let i = 0; i < vec1.indices.length; i++) {
    const idx = vec1.indices[i];
    const val1 = vec1.values[i];
    const val2 = vec2Map.get(idx);
    
    if (val2 !== undefined) {
      dotProduct += val1 * val2;
    }
  }

  return dotProduct;
}

/**
 * Batch generate sparse vectors
 */
export async function batchGenerateSparseVectors(
  texts: string[]
): Promise<SparseVector[]> {
  // For now, generate sequentially
  // TODO: Optimize with batching when using actual BGE-M3 API
  return Promise.all(texts.map(text => generateSparseVector(text)));
}
