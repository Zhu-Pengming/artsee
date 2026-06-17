ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS membership_status TEXT NOT NULL DEFAULT 'free'
    CHECK (membership_status IN ('free', 'member', 'expired')),
  ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_started_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_profiles_membership_status_expires
  ON user_profiles (membership_status, membership_expires_at);

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS supports_online BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS supports_offline BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contract_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_organizations_matching_city
  ON organizations (status, city);

CREATE INDEX IF NOT EXISTS idx_organizations_matching_province
  ON organizations (status, province);

CREATE INDEX IF NOT EXISTS idx_organizations_rating
  ON organizations (status, rating DESC, review_count DESC);

CREATE INDEX IF NOT EXISTS idx_organizations_focus_areas_gin
  ON organizations USING GIN (focus_areas);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS product_type TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_product_type_status
  ON orders (product_type, status);

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  file_url TEXT,
  signed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'disputed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_user_created
  ON contracts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contracts_organization_created
  ON contracts (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contracts_consultation
  ON contracts (consultation_id);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contracts_select_own_or_org_member" ON contracts;
CREATE POLICY "contracts_select_own_or_org_member"
  ON contracts
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM organization_members
      WHERE organization_members.organization_id = contracts.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "contracts_insert_own" ON contracts;
CREATE POLICY "contracts_insert_own"
  ON contracts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "contracts_update_own_or_org_member" ON contracts;
CREATE POLICY "contracts_update_own_or_org_member"
  ON contracts
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM organization_members
      WHERE organization_members.organization_id = contracts.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.status = 'active'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM organization_members
      WHERE organization_members.organization_id = contracts.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "contracts_no_direct_delete" ON contracts;
CREATE POLICY "contracts_no_direct_delete"
  ON contracts
  FOR DELETE USING (false);

NOTIFY pgrst, 'reload schema';
