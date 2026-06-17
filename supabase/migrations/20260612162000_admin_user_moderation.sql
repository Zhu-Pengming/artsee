ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS banned_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS banned_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_note TEXT;

CREATE INDEX IF NOT EXISTS idx_user_profiles_role_status
  ON user_profiles (role, status);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_role_status
  ON user_profiles (user_role, status);
