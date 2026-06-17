ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS creator_level TEXT NOT NULL DEFAULT 'none'
    CHECK (creator_level IN ('none', 'creator', 'active_creator', 'opinion_leader')),
  ADD COLUMN IF NOT EXISTS content_count INT NOT NULL DEFAULT 0 CHECK (content_count >= 0),
  ADD COLUMN IF NOT EXISTS creator_score INT NOT NULL DEFAULT 0 CHECK (creator_score >= 0),
  ADD COLUMN IF NOT EXISTS creator_upgraded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_profiles_creator_level
  ON user_profiles (creator_level, creator_score DESC, content_count DESC);
