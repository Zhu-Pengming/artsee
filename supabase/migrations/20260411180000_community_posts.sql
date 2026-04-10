-- 社区图文帖（类小红书）：多图 + 正文，与论坛 posts 表分离
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  body TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden')),
  like_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts (author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts (status);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- 匿名可读已发布
CREATE POLICY "community_posts_select_published"
  ON community_posts FOR SELECT
  USING (status = 'published');

-- 本人读写自己的行
CREATE POLICY "community_posts_insert_own"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "community_posts_update_own"
  ON community_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "community_posts_delete_own"
  ON community_posts FOR DELETE
  USING (auth.uid() = author_id);
