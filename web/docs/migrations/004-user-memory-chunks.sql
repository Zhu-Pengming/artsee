-- 阶段 4:语义记忆 - 向量化历史对话片段
-- 用途:让 AI 能记住"我们之前讨论过的具体事情",而不只是结构化字段

-- 创建 user_memory_chunks 表(照 document_chunks schema)
create table if not exists user_memory_chunks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid,                   -- 对话 ID(可选)
  content text not null,                  -- 记忆内容(对话片段)
  embedding vector(1024),                 -- GLM embedding-2 向量(1024 维)
  importance numeric default 0.5,         -- 重要性 0-1(高 importance 优先检索)
  source text not null,                   -- 来源:'pin'(用户主动 pin) / 'auto'(自动判定) / 'sediment'(沉淀结论)
  tags text[],                            -- 标签(可选,用于分类)
  created_at timestamptz default now(),
  expires_at timestamptz                  -- 过期时间(可选,短期记忆设过期)
);

-- 向量索引:使用 ivfflat 做近似最近邻搜索
create index if not exists idx_user_memory_chunks_embedding 
  on user_memory_chunks 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 索引:按用户 + 时间查询
create index if not exists idx_user_memory_chunks_user_time 
  on user_memory_chunks(user_id, created_at desc);

-- 索引:按用户 + importance 查询(用于优先检索重要记忆)
create index if not exists idx_user_memory_chunks_user_importance 
  on user_memory_chunks(user_id, importance desc);

-- 索引:按 conversation_id 查询
create index if not exists idx_user_memory_chunks_conversation 
  on user_memory_chunks(conversation_id) 
  where conversation_id is not null;

-- RLS 策略:用户只能看到自己的记忆
alter table user_memory_chunks enable row level security;

create policy "Users can view their own user_memory_chunks"
  on user_memory_chunks for select
  using (auth.uid() = user_id);

create policy "Service role can manage all user_memory_chunks"
  on user_memory_chunks for all
  using (auth.role() = 'service_role');

-- 注释
comment on table user_memory_chunks is '语义记忆表:向量化的历史对话片段,支持语义检索';
comment on column user_memory_chunks.content is '记忆内容,对话片段或沉淀结论';
comment on column user_memory_chunks.embedding is 'GLM embedding-2 向量(1024 维)';
comment on column user_memory_chunks.importance is '重要性 0-1,高 importance 优先检索';
comment on column user_memory_chunks.source is '来源:pin(用户主动)/auto(自动判定)/sediment(沉淀结论)';
comment on column user_memory_chunks.expires_at is '过期时间,短期记忆可设过期';
