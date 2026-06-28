ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS conversations_type_check;

ALTER TABLE conversations
  ADD CONSTRAINT conversations_type_check
  CHECK (
    type IN (
      'direct',
      'organization',
      'group',
      'cooperation',
      'opportunity',
      'circle',
      'salon',
      'system'
    )
  );

ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_message_type_check;

ALTER TABLE messages
  ADD CONSTRAINT messages_message_type_check
  CHECK (message_type IN ('text', 'image', 'file', 'system'));

CREATE INDEX IF NOT EXISTS idx_conversations_org_student
  ON conversations ((metadata->>'organization_id'), (metadata->>'student_user_id'), updated_at DESC)
  WHERE type = 'organization';

NOTIFY pgrst, 'reload schema';
