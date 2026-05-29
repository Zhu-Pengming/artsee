-- 修复 AI 对话表结构，确保与实际需求一致

-- 1. 确保 ai_conversations 有 last_message_preview 列
ALTER TABLE ai_conversations 
  ADD COLUMN IF NOT EXISTS last_message_preview TEXT;

-- 2. 确保 ai_messages 有 user_id 列（用于 RLS）
ALTER TABLE ai_messages
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE;

-- 3. 更新现有 ai_messages 的 user_id（从 conversation 获取）
UPDATE ai_messages
SET user_id = ac.user_id
FROM ai_conversations ac
WHERE ai_messages.conversation_id = ac.id
  AND ai_messages.user_id IS NULL;

-- 4. 设置 user_id 为 NOT NULL（在填充数据后）
-- 注意：如果有孤立的消息（conversation 不存在），需要先清理
DELETE FROM ai_messages
WHERE conversation_id NOT IN (SELECT id FROM ai_conversations);

-- 现在可以安全地设置 NOT NULL
ALTER TABLE ai_messages
  ALTER COLUMN user_id SET NOT NULL;

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_created
  ON ai_messages (user_id, created_at DESC);

-- 6. 更新 RLS 策略
DROP POLICY IF EXISTS "ai_messages_select" ON ai_messages;
DROP POLICY IF EXISTS "ai_messages_insert" ON ai_messages;
DROP POLICY IF EXISTS "ai_messages_update" ON ai_messages;
DROP POLICY IF EXISTS "ai_messages_delete" ON ai_messages;

-- 简化的 RLS：用户只能访问自己的消息
CREATE POLICY "ai_messages_own"
  ON ai_messages
  USING (user_id = auth.uid());

-- 允许 service role 插入（后端 API 会设置正确的 user_id）
CREATE POLICY "ai_messages_service_insert"
  ON ai_messages FOR INSERT
  WITH CHECK (true);

-- 7. 更新触发器，确保 last_message_preview 正确更新
CREATE OR REPLACE FUNCTION update_ai_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations
  SET updated_at = now(),
      last_message_preview = CASE
        WHEN NEW.role = 'user' THEN substring(NEW.content, 1, 50)
        ELSE last_message_preview
      END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
