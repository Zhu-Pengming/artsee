ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS student_last_read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS handler_last_read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_consultations_student_last_read
  ON consultations (user_id, student_last_read_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_handler_last_read_user
  ON consultations (assigned_to_user_id, handler_last_read_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_handler_last_read_org
  ON consultations (assigned_to_org_id, handler_last_read_at DESC);

NOTIFY pgrst, 'reload schema';
