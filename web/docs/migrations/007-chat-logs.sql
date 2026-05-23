-- Migration: Add chat_logs table for conversation logging
-- Purpose: Enable evaluation sampling, prompt tuning, and analytics
-- Privacy: Ensure compliance before enabling in production

CREATE TABLE chat_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id),
  route               TEXT NOT NULL CHECK (route IN ('chat', 'consult')),
  query               TEXT NOT NULL,
  rewritten_query     TEXT,                  -- Phase 1.5 用
  intent              TEXT,
  retrieved_chunk_ids UUID[],
  answer              TEXT,
  low_confidence      BOOLEAN DEFAULT false,
  latency_ms          INT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_chat_logs_user_time ON chat_logs (user_id, created_at DESC);
CREATE INDEX idx_chat_logs_intent_time ON chat_logs (intent, created_at DESC);
CREATE INDEX idx_chat_logs_route ON chat_logs (route);

-- Optional: Add RLS policy if needed
-- ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own logs" ON chat_logs
--   FOR SELECT USING (auth.uid() = user_id);

COMMENT ON TABLE chat_logs IS 'Conversation logs for evaluation and analytics. Fire-and-forget writes, no blocking.';
COMMENT ON COLUMN chat_logs.rewritten_query IS 'Query after history/profile rewriting (Phase 1.5)';
COMMENT ON COLUMN chat_logs.retrieved_chunk_ids IS 'Chunk IDs used in RAG context';
COMMENT ON COLUMN chat_logs.low_confidence IS 'Evidence guard triggered (Phase 2)';
