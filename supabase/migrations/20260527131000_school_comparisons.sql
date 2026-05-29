CREATE TABLE IF NOT EXISTS school_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  school_ids UUID[] NOT NULL,
  dimensions TEXT[] NOT NULL DEFAULT ARRAY[
    'rank',
    'location',
    'portfolio',
    'programs',
    'cost',
    'career'
  ]::TEXT[],
  result_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_comparisons_user_created
  ON school_comparisons (user_id, created_at DESC);

ALTER TABLE school_comparisons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_comparisons_select_own" ON school_comparisons;
DROP POLICY IF EXISTS "school_comparisons_insert_own_or_guest" ON school_comparisons;

CREATE POLICY "school_comparisons_select_own"
  ON school_comparisons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "school_comparisons_insert_own_or_guest"
  ON school_comparisons FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
