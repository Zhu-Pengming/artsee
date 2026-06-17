CREATE TABLE IF NOT EXISTS mentor_availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reserved', 'booked', 'blocked', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_mentor_availability_slots_mentor_starts
  ON mentor_availability_slots (mentor_id, starts_at);

CREATE INDEX IF NOT EXISTS idx_mentor_availability_slots_open
  ON mentor_availability_slots (mentor_id, status, starts_at);

DROP TRIGGER IF EXISTS trg_mentor_availability_slots_updated_at ON mentor_availability_slots;
CREATE TRIGGER trg_mentor_availability_slots_updated_at
  BEFORE UPDATE ON mentor_availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION set_mentors_updated_at();

ALTER TABLE mentor_availability_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_availability_select_public_or_owner" ON mentor_availability_slots;
CREATE POLICY "mentor_availability_select_public_or_owner"
  ON mentor_availability_slots
  FOR SELECT
  USING (
    status = 'open'
    OR EXISTS (
      SELECT 1 FROM mentors
      WHERE mentors.id = mentor_availability_slots.mentor_id
        AND mentors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "mentor_availability_no_direct_insert" ON mentor_availability_slots;
CREATE POLICY "mentor_availability_no_direct_insert"
  ON mentor_availability_slots
  FOR INSERT
  WITH CHECK (false);
