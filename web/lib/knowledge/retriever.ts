import { getSupabaseAdmin } from './supabase-admin';
import { generateEmbeddings } from './embedder';

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  schoolId: string;
  schoolName?: string;
  chunkText: string;
  headingPath: string;
  similarity: number;
  tokenCount: number;
}

export interface SearchOptions {
  schoolId?: string;
  matchThreshold?: number;
  matchCount?: number;
}

export async function searchKnowledge(
  query: string,
  options: SearchOptions = {}
): Promise<RetrievedChunk[]> {
  const {
    schoolId,
    matchThreshold = 0.4,
    matchCount = 5,
  } = options;

  const [queryEmbedding] = await generateEmbeddings([query]);

  const { data, error } = await (getSupabaseAdmin() as any).rpc(
    'match_document_chunks',
    {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_school_id: schoolId || null,
    }
  );

  if (error) {
    console.error('Vector search error:', error);
    throw new Error(`Failed to search knowledge base: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  const chunks: RetrievedChunk[] = data.map((row: any) => ({
    chunkId: row.chunk_id,
    documentId: row.document_id,
    schoolId: row.school_id,
    chunkText: row.chunk_text,
    headingPath: row.heading_path,
    similarity: row.similarity,
    tokenCount: row.token_count || 0,
  }));

  return chunks;
}

export async function searchKnowledgeWithSchoolInfo(
  query: string,
  options: SearchOptions = {}
): Promise<RetrievedChunk[]> {
  const chunks = await searchKnowledge(query, options);

  if (chunks.length === 0) {
    return [];
  }

  const schoolIds = [...new Set(chunks.map((c) => c.schoolId))];

  const { data: schools } = await (getSupabaseAdmin() as any)
    .from('schools')
    .select('id, name_en')
    .in('id', schoolIds);

  const schoolMap = new Map(
    schools?.map((s: any) => [s.id, s.name_en]) || []
  );

  return chunks.map((chunk) => ({
    ...chunk,
    schoolName: schoolMap.get(chunk.schoolId) as string | undefined,
  }));
}
