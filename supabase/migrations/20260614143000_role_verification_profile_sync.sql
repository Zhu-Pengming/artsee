ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS user_type TEXT,
  ADD COLUMN IF NOT EXISTS user_role TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_user_profiles_type_role_verified
  ON user_profiles (user_type, user_role, is_verified);
