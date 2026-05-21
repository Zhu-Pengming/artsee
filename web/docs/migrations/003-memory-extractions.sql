-- 阶段 3:Record - 记忆抽取审计表
-- 用途:记录每次从对话中抽取的画像候选,保留原始证据,支持审计和"查看来源"功能

-- 创建 memory_extractions 表
create table if not exists memory_extractions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid,                   -- 对话 ID(可选,用于关联对话上下文)
  message_id text,                        -- 消息 ID(可选,用于定位具体消息)
  source_route text not null,             -- 来源路由:'chat' / 'consult' / 'schools_search' / 'record_api'
  raw_user_message text not null,         -- 用户原话(证据)
  extracted_field text not null,          -- 抽取的字段名,例:'target_countries'
  old_value jsonb,                        -- upsert 前的旧值
  new_value jsonb not null,               -- 新值
  action text not null,                   -- 操作类型:'create' / 'update' / 'delete' / 'append'
  confidence numeric default 0.8,         -- 置信度 0-1
  guard_passed boolean default true,      -- 是否通过硬规则护栏
  applied_to_profile boolean default false, -- 是否已应用到 user_profiles
  created_at timestamptz default now()
);

-- 索引:按用户 + 字段 + 时间查询(用于字段历史查询)
create index if not exists idx_memory_extractions_user_field_time 
  on memory_extractions(user_id, extracted_field, created_at desc);

-- 索引:按用户 + 时间查询(用于 Reflection 扫描)
create index if not exists idx_memory_extractions_user_time 
  on memory_extractions(user_id, created_at desc);

-- 索引:按 conversation_id 查询(用于对话级别的记忆回溯)
create index if not exists idx_memory_extractions_conversation 
  on memory_extractions(conversation_id) 
  where conversation_id is not null;

-- RLS 策略:用户只能看到自己的记录
alter table memory_extractions enable row level security;

create policy "Users can view their own memory extractions"
  on memory_extractions for select
  using (auth.uid() = user_id);

create policy "Service role can manage all memory extractions"
  on memory_extractions for all
  using (auth.role() = 'service_role');

-- 注释
comment on table memory_extractions is '记忆抽取审计表:记录每次从对话中抽取的画像候选,保留原始证据';
comment on column memory_extractions.source_route is '来源路由:chat/consult/schools_search/record_api';
comment on column memory_extractions.raw_user_message is '用户原话,作为抽取的证据';
comment on column memory_extractions.extracted_field is '抽取的字段名,对应 user_profiles 表的列名';
comment on column memory_extractions.action is '操作类型:create(新建)/update(更新)/delete(删除)/append(追加到数组)';
comment on column memory_extractions.confidence is '置信度 0-1,低于阈值的抽取不会自动应用';
comment on column memory_extractions.guard_passed is '是否通过硬规则护栏(翻译/假设/第三人称等场景会被拦截)';
comment on column memory_extractions.applied_to_profile is '是否已应用到 user_profiles 表';
