CREATE TABLE IF NOT EXISTS consultation_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (consultation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_consultation_reviews_org_created
  ON consultation_reviews (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultation_reviews_user_created
  ON consultation_reviews (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_consultation_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_consultation_reviews_updated_at ON consultation_reviews;
CREATE TRIGGER trg_consultation_reviews_updated_at
  BEFORE UPDATE ON consultation_reviews
  FOR EACH ROW
  EXECUTE FUNCTION set_consultation_reviews_updated_at();

ALTER TABLE consultation_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consultation_reviews_select_own_or_org_member" ON consultation_reviews;
CREATE POLICY "consultation_reviews_select_own_or_org_member"
  ON consultation_reviews
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM organization_members
      WHERE organization_members.organization_id = consultation_reviews.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "consultation_reviews_insert_own_consultation" ON consultation_reviews;
CREATE POLICY "consultation_reviews_insert_own_consultation"
  ON consultation_reviews
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM consultations
      WHERE consultations.id = consultation_reviews.consultation_id
        AND consultations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "consultation_reviews_no_direct_update" ON consultation_reviews;
CREATE POLICY "consultation_reviews_no_direct_update"
  ON consultation_reviews
  FOR UPDATE USING (false);

DROP POLICY IF EXISTS "consultation_reviews_no_direct_delete" ON consultation_reviews;
CREATE POLICY "consultation_reviews_no_direct_delete"
  ON consultation_reviews
  FOR DELETE USING (false);

NOTIFY pgrst, 'reload schema';
