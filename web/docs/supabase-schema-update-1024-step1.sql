-- =====================================================
-- Step 1: 删除索引和清空数据（减少内存占用）
-- =====================================================

-- 删除现有的向量索引
DROP INDEX IF EXISTS idx_document_chunks_embedding;
DROP INDEX IF EXISTS idx_topic_chunks_embedding;

-- 清空 embedding 数据（减少 ALTER COLUMN 的内存需求）
UPDATE document_chunks SET embedding = NULL;
UPDATE topic_chunks SET embedding = NULL WHERE embedding IS NOT NULL;

-- 验证
SELECT COUNT(*) as total_chunks, 
       COUNT(embedding) as chunks_with_embedding 
FROM document_chunks;
