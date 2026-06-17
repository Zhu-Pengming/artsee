CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  university TEXT,
  major TEXT,
  degree TEXT,
  proof_materials JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('draft', 'pending', 'verified', 'rejected')),
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INT NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'rejected', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mentor_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL DEFAULT 'portfolio_review',
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  price_amount INT NOT NULL DEFAULT 0 CHECK (price_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'cny',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mentor_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  mentor_service_id UUID REFERENCES mentor_services(id) ON DELETE SET NULL,
  student_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'confirmed', 'scheduled', 'completed', 'canceled', 'rejected')),
  student_note TEXT,
  advisor_note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentors_status_verified_created
  ON mentors (status, verification_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_services_mentor_status
  ON mentor_services (mentor_id, status);

CREATE INDEX IF NOT EXISTS idx_mentor_bookings_student_created
  ON mentor_bookings (student_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_bookings_mentor_created
  ON mentor_bookings (mentor_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_mentors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mentors_updated_at ON mentors;
CREATE TRIGGER trg_mentors_updated_at
  BEFORE UPDATE ON mentors
  FOR EACH ROW
  EXECUTE FUNCTION set_mentors_updated_at();

DROP TRIGGER IF EXISTS trg_mentor_services_updated_at ON mentor_services;
CREATE TRIGGER trg_mentor_services_updated_at
  BEFORE UPDATE ON mentor_services
  FOR EACH ROW
  EXECUTE FUNCTION set_mentors_updated_at();

DROP TRIGGER IF EXISTS trg_mentor_bookings_updated_at ON mentor_bookings;
CREATE TRIGGER trg_mentor_bookings_updated_at
  BEFORE UPDATE ON mentor_bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_mentors_updated_at();

ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentors_select_public_or_own" ON mentors;
CREATE POLICY "mentors_select_public_or_own"
  ON mentors
  FOR SELECT
  USING (
    (status = 'active' AND verification_status = 'verified')
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "mentor_services_select_public_or_own" ON mentor_services;
CREATE POLICY "mentor_services_select_public_or_own"
  ON mentor_services
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentors
      WHERE mentors.id = mentor_services.mentor_id
        AND (
          (mentors.status = 'active' AND mentors.verification_status = 'verified' AND mentor_services.status = 'active')
          OR mentors.user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "mentor_bookings_select_participants" ON mentor_bookings;
CREATE POLICY "mentor_bookings_select_participants"
  ON mentor_bookings
  FOR SELECT
  USING (
    student_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM mentors
      WHERE mentors.id = mentor_bookings.mentor_id
        AND mentors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "mentors_no_direct_insert" ON mentors;
CREATE POLICY "mentors_no_direct_insert"
  ON mentors
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "mentor_services_no_direct_insert" ON mentor_services;
CREATE POLICY "mentor_services_no_direct_insert"
  ON mentor_services
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "mentor_bookings_no_direct_insert" ON mentor_bookings;
CREATE POLICY "mentor_bookings_no_direct_insert"
  ON mentor_bookings
  FOR INSERT
  WITH CHECK (false);
