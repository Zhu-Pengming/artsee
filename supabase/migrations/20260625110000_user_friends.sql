CREATE TABLE IF NOT EXISTS public.user_friends (
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'blocked', 'removed')),
  source TEXT NOT NULL DEFAULT 'manual',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id <> friend_id)
);

CREATE INDEX IF NOT EXISTS idx_user_friends_friend
  ON public.user_friends (friend_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_friends_user_status
  ON public.user_friends (user_id, status, created_at DESC);

ALTER TABLE public.user_friends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_friends_select_own" ON public.user_friends;
CREATE POLICY "user_friends_select_own"
  ON public.user_friends FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_friends_service_all" ON public.user_friends;
CREATE POLICY "user_friends_service_all"
  ON public.user_friends FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
