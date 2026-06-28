CREATE TABLE IF NOT EXISTS community_hot_topic_answer_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES community_hot_topics(id) ON DELETE CASCADE,
  answer_index INT NOT NULL CHECK (answer_index >= 0),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (topic_id, answer_index, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hot_topic_answer_likes_topic_answer
  ON community_hot_topic_answer_likes (topic_id, answer_index, created_at DESC);

CREATE TABLE IF NOT EXISTS community_hot_topic_answer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES community_hot_topics(id) ON DELETE CASCADE,
  answer_index INT NOT NULL CHECK (answer_index >= 0),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hot_topic_answer_comments_topic_answer
  ON community_hot_topic_answer_comments (topic_id, answer_index, status, created_at);

CREATE INDEX IF NOT EXISTS idx_hot_topic_answer_comments_author
  ON community_hot_topic_answer_comments (author_id, created_at DESC);

ALTER TABLE community_hot_topic_answer_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_hot_topic_answer_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hot_topic_answer_likes_select" ON community_hot_topic_answer_likes;
CREATE POLICY "hot_topic_answer_likes_select"
  ON community_hot_topic_answer_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "hot_topic_answer_likes_insert_own" ON community_hot_topic_answer_likes;
CREATE POLICY "hot_topic_answer_likes_insert_own"
  ON community_hot_topic_answer_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "hot_topic_answer_likes_delete_own" ON community_hot_topic_answer_likes;
CREATE POLICY "hot_topic_answer_likes_delete_own"
  ON community_hot_topic_answer_likes FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "hot_topic_answer_comments_select_published" ON community_hot_topic_answer_comments;
CREATE POLICY "hot_topic_answer_comments_select_published"
  ON community_hot_topic_answer_comments FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "hot_topic_answer_comments_insert_own" ON community_hot_topic_answer_comments;
CREATE POLICY "hot_topic_answer_comments_insert_own"
  ON community_hot_topic_answer_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id AND status = 'published');

DROP POLICY IF EXISTS "hot_topic_answer_comments_update_own" ON community_hot_topic_answer_comments;
CREATE POLICY "hot_topic_answer_comments_update_own"
  ON community_hot_topic_answer_comments FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);
