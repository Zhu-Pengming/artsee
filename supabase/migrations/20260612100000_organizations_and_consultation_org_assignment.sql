CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended')),
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner
  ON organizations (owner_user_id);

CREATE INDEX IF NOT EXISTS idx_organizations_status_type
  ON organizations (status, type);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'advisor', 'member')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'invited', 'disabled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_members_user_status
  ON organization_members (user_id, status);

CREATE INDEX IF NOT EXISTS idx_organization_members_org_status
  ON organization_members (organization_id, status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'consultations_assigned_to_org_id_fkey'
  ) THEN
    ALTER TABLE consultations
      ADD CONSTRAINT consultations_assigned_to_org_id_fkey
      FOREIGN KEY (assigned_to_org_id)
      REFERENCES organizations(id)
      ON DELETE SET NULL
      NOT VALID;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_consultations_assigned_org_status_updated
  ON consultations (assigned_to_org_id, status, updated_at DESC);

CREATE OR REPLACE FUNCTION set_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION set_organizations_updated_at();

DROP TRIGGER IF EXISTS trg_organization_members_updated_at ON organization_members;
CREATE TRIGGER trg_organization_members_updated_at
  BEFORE UPDATE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION set_organizations_updated_at();

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_select_active_or_member"
  ON organizations;
DROP POLICY IF EXISTS "organization_members_select_own"
  ON organization_members;

CREATE POLICY "organizations_select_active_or_member"
  ON organizations
  FOR SELECT
  USING (
    status = 'active'
    OR owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM organization_members
      WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
        AND organization_members.status = 'active'
    )
  );

CREATE POLICY "organization_members_select_own"
  ON organization_members
  FOR SELECT
  USING (user_id = auth.uid());
