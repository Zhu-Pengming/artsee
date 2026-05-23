-- =====================================================
-- Step 4: 更新 RPC 函数
-- =====================================================

-- 更新 match_document_chunks 函数的参数类型
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding VECTOR(1024),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_school_id UUID DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  school_id UUID,
  chunk_text TEXT,
  heading_path TEXT,
  similarity FLOAT,
  token_count INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id AS chunk_id,
    dc.document_id,
    sd.school_id,
    dc.chunk_text,
    dc.heading_path,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.token_count
  FROM document_chunks dc
  JOIN school_documents sd ON dc.document_id = sd.id
  WHERE 
    (filter_school_id IS NULL OR sd.school_id = filter_school_id)
    AND dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 更新 match_topic_chunks 函数（如果存在）
CREATE OR REPLACE FUNCTION match_topic_chunks(
  query_embedding VECTOR(1024),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  chunk_id UUID,
  topic_id UUID,
  chunk_text TEXT,
  heading_path TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.id AS chunk_id,
    tc.topic_id,
    tc.chunk_text,
    tc.heading_path,
    1 - (tc.embedding <=> query_embedding) AS similarity
  FROM topic_chunks tc
  WHERE 
    tc.embedding IS NOT NULL
    AND 1 - (tc.embedding <=> query_embedding) > match_threshold
  ORDER BY tc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 验证函数
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'match_%chunks';
