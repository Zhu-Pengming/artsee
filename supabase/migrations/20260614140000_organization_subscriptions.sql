ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'expired')),
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT;

CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status_expires
  ON organizations (subscription_status, subscription_expires_at);

NOTIFY pgrst, 'reload schema';
