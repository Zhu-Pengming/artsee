-- =====================================================
-- Clean up: Delete all chunks to prepare for re-ingestion
-- =====================================================

-- Delete all document chunks
DELETE FROM document_chunks;

-- Delete all school documents
DELETE FROM school_documents;

-- Verify
SELECT COUNT(*) as total_chunks FROM document_chunks;
SELECT COUNT(*) as total_documents FROM school_documents;
