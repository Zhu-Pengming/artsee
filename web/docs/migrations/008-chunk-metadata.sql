-- Migration 008: Add chunk metadata for source tracking and confidence
-- Purpose: Enable Evidence Guard and source quality ranking
-- Phase: 2.1

-- Add metadata columns to document_chunks
ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('official', 'forum', 'blog', 'internal')),
  ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confidence NUMERIC(3,2) DEFAULT 0.80;

-- Add comments
COMMENT ON COLUMN document_chunks.source_url IS 'Original URL where content was fetched from';
COMMENT ON COLUMN document_chunks.source_type IS 'Source quality tier: official > internal > blog > forum';
COMMENT ON COLUMN document_chunks.fetched_at IS 'Timestamp when content was fetched';
COMMENT ON COLUMN document_chunks.confidence IS 'Confidence score for this chunk (0.00-1.00)';

-- Create index on source_type for filtering
CREATE INDEX IF NOT EXISTS idx_document_chunks_source_type ON document_chunks(source_type);

-- Update existing chunks to default values
UPDATE document_chunks
SET 
  source_type = 'internal',
  confidence = 0.80,
  fetched_at = NOW()
WHERE source_type IS NULL;
