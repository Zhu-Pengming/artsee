ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_community_posts_metadata_kind
  ON community_posts ((metadata->>'kind'));

CREATE TABLE IF NOT EXISTS community_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL DEFAULT 'art',
  city TEXT,
  cover_url TEXT,
  member_count INT NOT NULL DEFAULT 1 CHECK (member_count >= 0),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_circles_status_created
  ON community_circles (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_circles_category
  ON community_circles (category);

ALTER TABLE community_circles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_circles_select_published" ON community_circles;
DROP POLICY IF EXISTS "community_circles_insert_own" ON community_circles;
DROP POLICY IF EXISTS "community_circles_update_own" ON community_circles;

CREATE POLICY "community_circles_select_published"
  ON community_circles FOR SELECT
  USING (status = 'published');

CREATE POLICY "community_circles_insert_own"
  ON community_circles FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "community_circles_update_own"
  ON community_circles FOR UPDATE
  USING (auth.uid() = creator_id);
