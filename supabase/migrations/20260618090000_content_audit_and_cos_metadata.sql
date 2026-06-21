ALTER TABLE community_posts
  DROP CONSTRAINT IF EXISTS community_posts_status_check;

ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_status_check
  CHECK (status IN ('draft', 'reviewing', 'published', 'hidden', 'rejected'));

ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS audit_status TEXT
    CHECK (audit_status IS NULL OR audit_status IN ('pending', 'approved', 'reviewing', 'rejected')),
  ADD COLUMN IF NOT EXISTS audit_provider TEXT,
  ADD COLUMN IF NOT EXISTS audit_reason TEXT,
  ADD COLUMN IF NOT EXISTS audit_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS audited_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_community_posts_audit_status_created
  ON community_posts (audit_status, created_at DESC);

ALTER TABLE upload_files
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS bucket TEXT,
  ADD COLUMN IF NOT EXISTS object_key TEXT,
  ADD COLUMN IF NOT EXISTS audit_status TEXT
    CHECK (audit_status IS NULL OR audit_status IN ('pending', 'approved', 'reviewing', 'rejected')),
  ADD COLUMN IF NOT EXISTS audit_provider TEXT,
  ADD COLUMN IF NOT EXISTS audit_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS audited_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_upload_files_provider_object_key
  ON upload_files (provider, object_key);
