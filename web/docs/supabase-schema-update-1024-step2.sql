-- =====================================================
-- Step 2: 修改列类型为 VECTOR(1024)
-- =====================================================

-- 修改 document_chunks 表的 embedding 列类型
ALTER TABLE document_chunks 
  ALTER COLUMN embedding TYPE VECTOR(1024) 
  USING NULL;  -- 明确指定转换方式

-- 修改 topic_chunks 表的 embedding 列类型（如果存在）
ALTER TABLE topic_chunks 
  ALTER COLUMN embedding TYPE VECTOR(1024)
  USING NULL;

-- 验证列类型
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name IN ('document_chunks', 'topic_chunks')
  AND column_name = 'embedding';
