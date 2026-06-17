ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to_org_id UUID,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS target_major TEXT,
  ADD COLUMN IF NOT EXISTS intake TEXT,
  ADD COLUMN IF NOT EXISTS stage TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE consultations
  ALTER COLUMN status SET DEFAULT 'new';

ALTER TABLE consultations
  DROP CONSTRAINT IF EXISTS consultations_status_check;

ALTER TABLE consultations
  ADD CONSTRAINT consultations_status_check
  CHECK (status IN ('new', 'pending', 'active', 'closed', 'converted'))
  NOT VALID;

CREATE INDEX IF NOT EXISTS idx_consultations_status_updated
  ON consultations (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_assigned_user_updated
  ON consultations (assigned_to_user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_assigned_org_updated
  ON consultations (assigned_to_org_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS consultation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (
    sender_role IN ('student', 'advisor', 'institution', 'system')
  ),
  body TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultation_messages_thread
  ON consultation_messages (consultation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_consultation_messages_sender_created
  ON consultation_messages (sender_user_id, created_at DESC);

ALTER TABLE consultation_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consultation_messages_student_select_own"
  ON consultation_messages;
DROP POLICY IF EXISTS "consultation_messages_student_insert_own"
  ON consultation_messages;

CREATE POLICY "consultation_messages_student_select_own"
  ON consultation_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM consultations
      WHERE consultations.id = consultation_messages.consultation_id
        AND consultations.user_id = auth.uid()
    )
  );

CREATE POLICY "consultation_messages_student_insert_own"
  ON consultation_messages
  FOR INSERT
  WITH CHECK (
    sender_role = 'student'
    AND sender_user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM consultations
      WHERE consultations.id = consultation_messages.consultation_id
        AND consultations.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION update_consultation_from_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE consultations
  SET
    updated_at = now(),
    last_message = substring(NEW.body, 1, 160),
    status = CASE
      WHEN status IN ('new', 'pending')
        AND NEW.sender_role IN ('advisor', 'institution', 'system')
        THEN 'active'
      ELSE status
    END
  WHERE id = NEW.consultation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS consultation_messages_update_consultation
  ON consultation_messages;

CREATE TRIGGER consultation_messages_update_consultation
  AFTER INSERT ON consultation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_from_message();
