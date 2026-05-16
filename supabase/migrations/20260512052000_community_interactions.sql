-- 社区图文互动：点赞、评论与并发安全计数
CREATE TABLE IF NOT EXISTS community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts (id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_post_likes_post ON community_post_likes (post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user ON community_post_likes (user_id);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_post_created
  ON community_post_comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_author
  ON community_post_comments (author_id, created_at DESC);

ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_post_likes_select_all" ON community_post_likes;
DROP POLICY IF EXISTS "community_post_likes_insert_own" ON community_post_likes;
DROP POLICY IF EXISTS "community_post_likes_delete_own" ON community_post_likes;
DROP POLICY IF EXISTS "community_post_comments_select_published" ON community_post_comments;
DROP POLICY IF EXISTS "community_post_comments_insert_own" ON community_post_comments;
DROP POLICY IF EXISTS "community_post_comments_update_own" ON community_post_comments;
DROP POLICY IF EXISTS "community_post_comments_delete_own" ON community_post_comments;

CREATE POLICY "community_post_likes_select_all"
  ON community_post_likes FOR SELECT
  USING (true);

CREATE POLICY "community_post_likes_insert_own"
  ON community_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_post_likes_delete_own"
  ON community_post_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "community_post_comments_select_published"
  ON community_post_comments FOR SELECT
  USING (status = 'published');

CREATE POLICY "community_post_comments_insert_own"
  ON community_post_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "community_post_comments_update_own"
  ON community_post_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "community_post_comments_delete_own"
  ON community_post_comments FOR DELETE
  USING (auth.uid() = author_id);

CREATE OR REPLACE FUNCTION increment_community_post_like(p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_posts
  SET like_count = like_count + 1,
      updated_at = now()
  WHERE id = p_post_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_community_post_like(p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_posts
  SET like_count = GREATEST(like_count - 1, 0),
      updated_at = now()
  WHERE id = p_post_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_community_post_comment(p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_posts
  SET comment_count = comment_count + 1,
      updated_at = now()
  WHERE id = p_post_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_community_post_comment(p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_posts
  SET comment_count = GREATEST(comment_count - 1, 0),
      updated_at = now()
  WHERE id = p_post_id;
END;
$$;

NOTIFY pgrst, 'reload schema';
