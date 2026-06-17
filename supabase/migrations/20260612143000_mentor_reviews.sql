CREATE TABLE IF NOT EXISTS mentor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL UNIQUE REFERENCES mentor_bookings(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_reviews_mentor_created
  ON mentor_reviews (mentor_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_mentor_reviews_updated_at ON mentor_reviews;
CREATE TRIGGER trg_mentor_reviews_updated_at
  BEFORE UPDATE ON mentor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION set_mentors_updated_at();

ALTER TABLE mentor_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_reviews_select_public_or_participants" ON mentor_reviews;
CREATE POLICY "mentor_reviews_select_public_or_participants"
  ON mentor_reviews
  FOR SELECT
  USING (
    student_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM mentors
      WHERE mentors.id = mentor_reviews.mentor_id
        AND (
          mentors.user_id = auth.uid()
          OR (mentors.status = 'active' AND mentors.verification_status = 'verified')
        )
    )
  );

DROP POLICY IF EXISTS "mentor_reviews_no_direct_insert" ON mentor_reviews;
CREATE POLICY "mentor_reviews_no_direct_insert"
  ON mentor_reviews
  FOR INSERT
  WITH CHECK (false);
