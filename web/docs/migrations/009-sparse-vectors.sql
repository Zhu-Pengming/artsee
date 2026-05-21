-- Migration 009: Add sparse vector support for hybrid retrieval
-- Purpose: Enable dense + sparse vector fusion to improve recall
-- Phase: 2.5
-- Context: Similarity analysis shows margin=0.022 < 0.05, requiring hybrid retrieval

-- Add sparse_vector column to document_chunks
-- Sparse vector stored as JSONB: {"indices": [1, 5, 10], "values": [0.8, 0.6, 0.4]}
ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS sparse_vector JSONB;

-- Add GIN index for sparse vector queries
CREATE INDEX IF NOT EXISTS idx_document_chunks_sparse_vector 
  ON document_chunks USING GIN (sparse_vector);

-- Add comment
COMMENT ON COLUMN document_chunks.sparse_vector IS 'BGE-M3 sparse vector for hybrid retrieval (lexical matching)';

-- Note: Sparse vectors will be populated during re-embedding (P2.4)
-- Format: {"indices": [token_id, ...], "values": [weight, ...]}
-- Used for: Keyword-heavy queries (hard_data intent) and low-confidence scenarios
