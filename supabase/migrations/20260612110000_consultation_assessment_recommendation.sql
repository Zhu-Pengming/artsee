CREATE TABLE IF NOT EXISTS consultation_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  advisor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  background_summary TEXT,
  match_level TEXT CHECK (match_level IN ('strong', 'moderate', 'weak')),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultation_assessments_thread
  ON consultation_assessments (consultation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS consultation_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  advisor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  school_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline TEXT,
  portfolio_strategy TEXT,
  recommended_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultation_recommendations_thread
  ON consultation_recommendations (consultation_id, created_at DESC);

ALTER TABLE consultation_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consultation_assessments_select_student_own"
  ON consultation_assessments;
DROP POLICY IF EXISTS "consultation_assessments_select_assigned_user"
  ON consultation_assessments;
DROP POLICY IF EXISTS "consultation_assessments_no_direct_insert"
  ON consultation_assessments;
DROP POLICY IF EXISTS "consultation_assessments_no_direct_update"
  ON consultation_assessments;
DROP POLICY IF EXISTS "consultation_assessments_no_direct_delete"
  ON consultation_assessments;

CREATE POLICY "consultation_assessments_select_student_own"
  ON consultation_assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM consultations
      WHERE consultations.id = consultation_assessments.consultation_id
        AND consultations.user_id = auth.uid()
    )
  );

CREATE POLICY "consultation_assessments_select_assigned_user"
  ON consultation_assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM consultations
      WHERE consultations.id = consultation_assessments.consultation_id
        AND consultations.assigned_to_user_id = auth.uid()
    )
  );

CREATE POLICY "consultation_assessments_no_direct_insert"
  ON consultation_assessments
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "consultation_assessments_no_direct_update"
  ON consultation_assessments
  FOR UPDATE
  USING (false);

CREATE POLICY "consultation_assessments_no_direct_delete"
  ON consultation_assessments
  FOR DELETE
  USING (false);

DROP POLICY IF EXISTS "consultation_recommendations_select_student_own"
  ON consultation_recommendations;
DROP POLICY IF EXISTS "consultation_recommendations_select_assigned_user"
  ON consultation_recommendations;
DROP POLICY IF EXISTS "consultation_recommendations_no_direct_insert"
  ON consultation_recommendations;
DROP POLICY IF EXISTS "consultation_recommendations_no_direct_update"
  ON consultation_recommendations;
DROP POLICY IF EXISTS "consultation_recommendations_no_direct_delete"
  ON consultation_recommendations;

CREATE POLICY "consultation_recommendations_select_student_own"
  ON consultation_recommendations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM consultations
      WHERE consultations.id = consultation_recommendations.consultation_id
        AND consultations.user_id = auth.uid()
    )
  );

CREATE POLICY "consultation_recommendations_select_assigned_user"
  ON consultation_recommendations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM consultations
      WHERE consultations.id = consultation_recommendations.consultation_id
        AND consultations.assigned_to_user_id = auth.uid()
    )
  );

CREATE POLICY "consultation_recommendations_no_direct_insert"
  ON consultation_recommendations
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "consultation_recommendations_no_direct_update"
  ON consultation_recommendations
  FOR UPDATE
  USING (false);

CREATE POLICY "consultation_recommendations_no_direct_delete"
  ON consultation_recommendations
  FOR DELETE
  USING (false);

NOTIFY pgrst, 'reload schema';
