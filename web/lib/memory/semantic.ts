/**
 * 语义记忆 - 向量化历史对话片段
 * 
 * 功能:
 * 1. 写入:将关键对话片段向量化后存入 user_memory_chunks
 * 2. 检索:根据 query 语义检索用户的历史记忆
 */

import { createClient } from '@/lib/supabase/server';
import { generateEmbeddings } from '@/lib/knowledge/embedder';

export interface MemoryChunk {
  id: string;
  userId: string;
  conversationId?: string;
  content: string;
  importance: number;
  source: 'pin' | 'auto' | 'sediment';
  tags?: string[];
  createdAt: string;
  expiresAt?: string;
  similarity?: number;
}

export interface SaveMemoryInput {
  userId: string;
  content: string;
  importance?: number;
  source: 'pin' | 'auto' | 'sediment';
  conversationId?: string;
  tags?: string[];
  expiresAt?: Date;
}

/**
 * 保存记忆片段到语义记忆表
 * 
 * @param input - 记忆输入
 * @returns 是否成功
 */
export async function saveMemoryChunk(input: SaveMemoryInput): Promise<boolean> {
  try {
    // 生成 embedding
    const embeddings = await generateEmbeddings([input.content]);
    if (!embeddings || embeddings.length === 0) {
      console.error('[saveMemoryChunk] Failed to generate embedding');
      return false;
    }

    const embedding = embeddings[0];

    // 写入数据库
    const supabase = await createClient();
    const { error } = await supabase.from('user_memory_chunks').insert({
      user_id: input.userId,
      content: input.content,
      embedding,
      importance: input.importance ?? 0.5,
      source: input.source,
      conversation_id: input.conversationId,
      tags: input.tags,
      expires_at: input.expiresAt?.toISOString(),
    });

    if (error) {
      console.error('[saveMemoryChunk] Insert error:', error);
      return false;
    }

    console.log(`[saveMemoryChunk] Saved memory for user ${input.userId}, source: ${input.source}`);
    return true;
  } catch (error) {
    console.error('[saveMemoryChunk] Error:', error);
    return false;
  }
}

/**
 * 检索用户的语义记忆
 * 
 * @param userId - 用户 ID
 * @param query - 查询文本
 * @param options - 检索选项
 * @returns 记忆片段列表
 */
export async function searchUserMemories(
  userId: string,
  query: string,
  options?: {
    matchThreshold?: number;
    matchCount?: number;
  }
): Promise<MemoryChunk[]> {
  try {
    // 生成 query embedding
    const embeddings = await generateEmbeddings([query]);
    if (!embeddings || embeddings.length === 0) {
      console.warn('[searchUserMemories] Failed to generate query embedding');
      return [];
    }

    const queryEmbedding = embeddings[0];

    // 调用 RPC 检索
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('match_user_memory_chunks', {
      query_embedding: queryEmbedding,
      target_user_id: userId,
      match_threshold: options?.matchThreshold ?? 0.5,
      match_count: options?.matchCount ?? 5,
    });

    if (error) {
      console.error('[searchUserMemories] RPC error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      conversationId: row.conversation_id,
      content: row.content,
      importance: row.importance,
      source: row.source,
      tags: row.tags,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      similarity: row.similarity,
    }));
  } catch (error) {
    console.error('[searchUserMemories] Error:', error);
    return [];
  }
}

/**
 * 格式化记忆片段为 LLM prompt
 * 
 * @param memories - 记忆片段列表
 * @returns 格式化的文本
 */
export function formatMemoriesForPrompt(memories: MemoryChunk[]): string {
  if (memories.length === 0) {
    return '';
  }

  const lines = memories.map((m, i) => {
    const similarity = m.similarity ? `(相似度 ${(m.similarity * 100).toFixed(0)}%)` : '';
    return `${i + 1}. ${m.content} ${similarity}`;
  });

  return `## 相关历史对话\n\n${lines.join('\n')}`;
}
