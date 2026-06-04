CREATE TABLE IF NOT EXISTS saved_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools (id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, school_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_schools_user_saved
  ON saved_schools (user_id, saved_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_schools_school
  ON saved_schools (school_id);

ALTER TABLE saved_schools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_schools_select_own" ON saved_schools;
DROP POLICY IF EXISTS "saved_schools_insert_own" ON saved_schools;
DROP POLICY IF EXISTS "saved_schools_delete_own" ON saved_schools;

CREATE POLICY "saved_schools_select_own"
  ON saved_schools FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_schools_insert_own"
  ON saved_schools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_schools_delete_own"
  ON saved_schools FOR DELETE
  USING (auth.uid() = user_id);
