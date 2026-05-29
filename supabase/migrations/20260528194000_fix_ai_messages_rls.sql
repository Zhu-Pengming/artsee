-- 修复 ai_messages 的 RLS 策略，允许通过 service role 插入
-- 因为 ai_messages 没有 user_id 列，通过 conversation 关联用户

DROP POLICY IF EXISTS "ai_messages_own" ON ai_messages;

-- 查询策略：用户只能看到自己 conversation 的消息
CREATE POLICY "ai_messages_select"
  ON ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.user_id = auth.uid()
    )
  );

-- 插入策略：允许 service role 插入（后端 API 会验证权限）
CREATE POLICY "ai_messages_insert"
  ON ai_messages FOR INSERT
  WITH CHECK (true);

-- 更新和删除策略：通过 conversation 验证所有权
CREATE POLICY "ai_messages_update"
  ON ai_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "ai_messages_delete"
  ON ai_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.user_id = auth.uid()
    )
  );
