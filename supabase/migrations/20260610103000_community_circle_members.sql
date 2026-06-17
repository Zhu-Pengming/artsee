CREATE TABLE IF NOT EXISTS community_circle_members (
  circle_id UUID NOT NULL REFERENCES community_circles (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (circle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_circle_members_user
  ON community_circle_members (user_id, status);

ALTER TABLE community_circle_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_circle_members_select_own" ON community_circle_members;
DROP POLICY IF EXISTS "community_circle_members_insert_own" ON community_circle_members;
DROP POLICY IF EXISTS "community_circle_members_update_own" ON community_circle_members;

CREATE POLICY "community_circle_members_select_own"
  ON community_circle_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "community_circle_members_insert_own"
  ON community_circle_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_circle_members_update_own"
  ON community_circle_members FOR UPDATE
  USING (auth.uid() = user_id);
