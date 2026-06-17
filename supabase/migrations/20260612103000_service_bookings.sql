CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'consultation_followup',
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'confirmed', 'scheduled', 'completed', 'canceled')),
  scheduled_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (consultation_id)
);

CREATE INDEX IF NOT EXISTS idx_service_bookings_student_created
  ON service_bookings (student_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_bookings_assigned_user_created
  ON service_bookings (assigned_to_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_bookings_assigned_org_created
  ON service_bookings (assigned_to_org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_bookings_status_updated
  ON service_bookings (status, updated_at DESC);

CREATE OR REPLACE FUNCTION set_service_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_service_bookings_updated_at ON service_bookings;
CREATE TRIGGER trg_service_bookings_updated_at
  BEFORE UPDATE ON service_bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_service_bookings_updated_at();

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_bookings_select_student_own"
  ON service_bookings;
DROP POLICY IF EXISTS "service_bookings_select_assigned_user"
  ON service_bookings;
DROP POLICY IF EXISTS "service_bookings_select_assigned_org_member"
  ON service_bookings;
DROP POLICY IF EXISTS "service_bookings_no_direct_insert"
  ON service_bookings;
DROP POLICY IF EXISTS "service_bookings_no_direct_update"
  ON service_bookings;
DROP POLICY IF EXISTS "service_bookings_no_direct_delete"
  ON service_bookings;

CREATE POLICY "service_bookings_select_student_own"
  ON service_bookings
  FOR SELECT
  USING (student_user_id = auth.uid());

CREATE POLICY "service_bookings_select_assigned_user"
  ON service_bookings
  FOR SELECT
  USING (assigned_to_user_id = auth.uid());

CREATE POLICY "service_bookings_select_assigned_org_member"
  ON service_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM organization_members
      WHERE organization_members.organization_id = service_bookings.assigned_to_org_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.status = 'active'
    )
  );

CREATE POLICY "service_bookings_no_direct_insert"
  ON service_bookings
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "service_bookings_no_direct_update"
  ON service_bookings
  FOR UPDATE
  USING (false);

CREATE POLICY "service_bookings_no_direct_delete"
  ON service_bookings
  FOR DELETE
  USING (false);
