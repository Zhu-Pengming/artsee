-- 阶段 4:语义记忆 RPC - 向量相似度检索函数
-- 照抄 match_document_chunks 的实现,加 user_id 过滤

-- 创建 match_user_memory_chunks RPC 函数
create or replace function match_user_memory_chunks(
  query_embedding vector(1024),
  target_user_id uuid,
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id uuid,
  user_id uuid,
  conversation_id uuid,
  content text,
  importance numeric,
  source text,
  tags text[],
  created_at timestamptz,
  expires_at timestamptz,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    user_memory_chunks.id,
    user_memory_chunks.user_id,
    user_memory_chunks.conversation_id,
    user_memory_chunks.content,
    user_memory_chunks.importance,
    user_memory_chunks.source,
    user_memory_chunks.tags,
    user_memory_chunks.created_at,
    user_memory_chunks.expires_at,
    1 - (user_memory_chunks.embedding <=> query_embedding) as similarity
  from user_memory_chunks
  where 
    user_memory_chunks.user_id = target_user_id
    and 1 - (user_memory_chunks.embedding <=> query_embedding) > match_threshold
    and (user_memory_chunks.expires_at is null or user_memory_chunks.expires_at > now())
  order by 
    user_memory_chunks.importance desc,  -- 先按重要性排序
    similarity desc                       -- 再按相似度排序
  limit match_count;
end;
$$;

-- 注释
comment on function match_user_memory_chunks is '语义记忆检索:根据 query embedding 检索用户的历史对话片段,按 importance 和相似度排序';
