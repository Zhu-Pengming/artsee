ALTER TABLE public.ai_conversations
  ADD COLUMN IF NOT EXISTS ai_profile_key TEXT,
  ADD COLUMN IF NOT EXISTS user_role_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS user_type_snapshot TEXT;

COMMENT ON COLUMN public.ai_conversations.ai_profile_key IS 'AI 首页画像配置 key 快照，如 general/student/artist/collector/parent/business';
COMMENT ON COLUMN public.ai_conversations.user_role_snapshot IS '创建对话时的 user_profiles.user_role 快照';
COMMENT ON COLUMN public.ai_conversations.user_type_snapshot IS '创建对话时的 user_profiles.user_type 快照';
