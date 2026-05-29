-- 删除旧表（如果存在）
DROP TABLE IF EXISTS user_memory_chunks CASCADE;

-- 用户记忆块表：存储语义化的对话记忆
CREATE TABLE user_memory_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  conversation_id UUID,
  content TEXT NOT NULL,
  embedding vector(1024),
  importance NUMERIC(3, 2) DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
  source TEXT NOT NULL CHECK (source IN ('pin', 'auto', 'sediment')),
  tags TEXT[],
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_memory_chunks_user 
  ON user_memory_chunks (user_id);

CREATE INDEX IF NOT EXISTS idx_user_memory_chunks_created 
  ON user_memory_chunks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_memory_chunks_conversation 
  ON user_memory_chunks (conversation_id) WHERE conversation_id IS NOT NULL;

-- 向量索引（用于语义搜索）
CREATE INDEX IF NOT EXISTS idx_user_memory_chunks_embedding 
  ON user_memory_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- RLS 策略
ALTER TABLE user_memory_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_memory_chunks_select" ON user_memory_chunks;
DROP POLICY IF EXISTS "user_memory_chunks_insert" ON user_memory_chunks;
DROP POLICY IF EXISTS "user_memory_chunks_update" ON user_memory_chunks;
DROP POLICY IF EXISTS "user_memory_chunks_delete" ON user_memory_chunks;

-- 用户只能查看自己的记忆
CREATE POLICY "user_memory_chunks_select"
  ON user_memory_chunks FOR SELECT
  USING (user_id = auth.uid());

-- 允许 service role 插入（后端 API 会验证权限）
CREATE POLICY "user_memory_chunks_insert"
  ON user_memory_chunks FOR INSERT
  WITH CHECK (true);

-- 用户只能更新自己的记忆
CREATE POLICY "user_memory_chunks_update"
  ON user_memory_chunks FOR UPDATE
  USING (user_id = auth.uid());

-- 用户只能删除自己的记忆
CREATE POLICY "user_memory_chunks_delete"
  ON user_memory_chunks FOR DELETE
  USING (user_id = auth.uid());

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_user_memory_chunks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_memory_chunks_updated_at ON user_memory_chunks;
CREATE TRIGGER user_memory_chunks_updated_at
  BEFORE UPDATE ON user_memory_chunks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_memory_chunks_updated_at();

-- 删除旧的 RPC 函数（如果存在）
DROP FUNCTION IF EXISTS match_user_memory_chunks(vector, uuid, float, int);

-- RPC 函数：语义搜索用户记忆
CREATE OR REPLACE FUNCTION match_user_memory_chunks(
  query_embedding vector(1024),
  target_user_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  conversation_id UUID,
  content TEXT,
  importance NUMERIC,
  source TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    umc.id,
    umc.user_id,
    umc.conversation_id,
    umc.content,
    umc.importance,
    umc.source,
    umc.tags,
    umc.created_at,
    1 - (umc.embedding <=> query_embedding) AS similarity
  FROM user_memory_chunks umc
  WHERE umc.user_id = target_user_id
    AND 1 - (umc.embedding <=> query_embedding) >= match_threshold
    AND (umc.expires_at IS NULL OR umc.expires_at > now())
  ORDER BY umc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
