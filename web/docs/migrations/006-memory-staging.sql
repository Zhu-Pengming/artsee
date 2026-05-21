-- 阶段 5:暂存区 - 跨对话去重、合并 update 信号
-- 用途:在正式写入 user_profiles 前,先在暂存区做去重和合并,避免频繁更新同一字段

-- 创建 memory_staging 表
create table if not exists memory_staging (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_text text not null,                 -- 原始用户消息
  extracted jsonb not null,               -- 抽取结果(与 memory_extractions 格式一致)
  similar_existing_id uuid,               -- 引用 memory_extractions 的相似条目(用于去重)
  action text,                            -- 'merge'(合并) / 'update'(更新) / 'discard'(丢弃) / 'apply'(应用)
  status text default 'pending',          -- 'pending'(待处理) / 'processed'(已处理)
  created_at timestamptz default now()
);

-- 索引:按用户 + 状态查询
create index if not exists idx_memory_staging_user_status 
  on memory_staging(user_id, status);

-- 索引:按创建时间查询(用于 Reflection 扫描)
create index if not exists idx_memory_staging_created 
  on memory_staging(created_at desc);

-- RLS 策略:用户只能看到自己的暂存记录
alter table memory_staging enable row level security;

create policy "Users can view their own staging records"
  on memory_staging for select
  using (auth.uid() = user_id);

create policy "Service role can manage all staging records"
  on memory_staging for all
  using (auth.role() = 'service_role');

-- 注释
comment on table memory_staging is '记忆暂存区:跨对话去重、合并 update 信号,Reflection 前的缓冲层';
comment on column memory_staging.raw_text is '原始用户消息';
comment on column memory_staging.extracted is '抽取结果,格式与 memory_extractions 一致';
comment on column memory_staging.similar_existing_id is '引用 memory_extractions 的相似条目,用于去重';
comment on column memory_staging.action is '处理动作:merge/update/discard/apply';
comment on column memory_staging.status is '状态:pending(待处理)/processed(已处理)';
