-- =====================================================
-- Step 3: 更新默认值和重建索引
-- =====================================================

-- 更新默认 embedding 模型名称
ALTER TABLE document_chunks 
  ALTER COLUMN embedding_model SET DEFAULT 'bge-m3';

ALTER TABLE topic_chunks 
  ALTER COLUMN embedding_model SET DEFAULT 'bge-m3';

-- 重建向量索引（使用 ivfflat，适合 1024 维）
CREATE INDEX idx_document_chunks_embedding 
  ON document_chunks 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

CREATE INDEX idx_topic_chunks_embedding 
  ON topic_chunks 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 50);

-- 验证索引
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('document_chunks', 'topic_chunks')
  AND indexname LIKE '%embedding%';
