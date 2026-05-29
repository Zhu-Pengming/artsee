-- Node 2 core modules: verification, events, opportunities, artworks,
-- artists, favorites and notifications. Payment settlement, wallets and
-- full contract flows are intentionally left out of this milestone.

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role_code TEXT NOT NULL CHECK (
    role_code IN (
      'user',
      'student_verified',
      'artist_verified',
      'collector_verified',
      'business_verified',
      'admin',
      'super_admin'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_code)
);

CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('student', 'artist', 'collector', 'business')),
  materials JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note TEXT,
  reviewer_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verifications_user_created ON verifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verifications_status_created ON verifications (status, created_at DESC);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  city TEXT,
  venue TEXT,
  hotel_name TEXT,
  type TEXT NOT NULL DEFAULT 'salon',
  cover_url TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  quota INT CHECK (quota IS NULL OR quota >= 0),
  fee_amount INT NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'cny',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_status_start ON events (status, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_events_city_start ON events (city, start_time DESC);

CREATE TABLE IF NOT EXISTS event_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'waitlisted', 'pending_payment', 'registered', 'canceled')
  ),
  apply_note TEXT,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ticket_code TEXT UNIQUE,
  review_note TEXT,
  reviewer_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_applications_user_created ON event_applications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_applications_event_status ON event_applications (event_id, status);

CREATE TABLE IF NOT EXISTS event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  ticket_code TEXT NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  UNIQUE (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  license_url TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disabled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  business_id UUID REFERENCES business_profiles (id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'collaboration',
  city TEXT,
  budget_min INT CHECK (budget_min IS NULL OR budget_min >= 0),
  budget_max INT CHECK (budget_max IS NULL OR budget_max >= 0),
  deadline TIMESTAMPTZ,
  requirements TEXT,
  submission_materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_status_deadline ON opportunities (status, deadline DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_city_type ON opportunities (city, type);

CREATE TABLE IF NOT EXISTS opportunity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  portfolio_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  proposal TEXT,
  quote_amount INT CHECK (quote_amount IS NULL OR quote_amount >= 0),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('submitted', 'reviewing', 'approved', 'rejected', 'interview', 'contracting', 'executing', 'completed', 'canceled')
  ),
  review_note TEXT,
  reviewer_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_opportunity_applications_user_created ON opportunity_applications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_opp_status ON opportunity_applications (opportunity_id, status);

CREATE TABLE IF NOT EXISTS cooperation_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities (id) ON DELETE SET NULL,
  application_id UUID REFERENCES opportunity_applications (id) ON DELETE SET NULL,
  artist_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  business_id UUID REFERENCES business_profiles (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  contract_status TEXT NOT NULL DEFAULT 'not_started',
  project_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    project_status IN ('pending', 'active', 'paused', 'completed', 'canceled')
  ),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cooperation_projects_artist_created ON cooperation_projects (artist_id, created_at DESC);

CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT,
  art_fields TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  style_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  experience TEXT,
  cooperation_intent TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  copyright_status TEXT NOT NULL DEFAULT 'self_owned',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'platform_only', 'partners_only', 'private')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'reviewing', 'rejected', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artworks_status_created ON artworks (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_user_created ON artworks (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS artwork_stats (
  artwork_id UUID PRIMARY KEY REFERENCES artworks (id) ON DELETE CASCADE,
  views INT NOT NULL DEFAULT 0 CHECK (views >= 0),
  likes INT NOT NULL DEFAULT 0 CHECK (likes >= 0),
  favorites INT NOT NULL DEFAULT 0 CHECK (favorites >= 0),
  inquiries INT NOT NULL DEFAULT 0 CHECK (inquiries >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_type_created ON favorites (user_id, target_type, created_at DESC);

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_target ON likes (target_type, target_id);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT NOT NULL DEFAULT 'system',
  read_status TEXT NOT NULL DEFAULT 'unread' CHECK (read_status IN ('unread', 'read')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, read_status);

CREATE TABLE IF NOT EXISTS upload_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  scene TEXT,
  size INT CHECK (size IS NULL OR size >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION increment_artwork_views(p_artwork_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO artwork_stats (artwork_id, views)
  VALUES (p_artwork_id, 1)
  ON CONFLICT (artwork_id)
  DO UPDATE SET
    views = artwork_stats.views + 1,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION refresh_artwork_engagement_stats(p_artwork_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO artwork_stats (artwork_id, likes, favorites)
  VALUES (
    p_artwork_id,
    (SELECT count(*)::int FROM likes WHERE target_type = 'artwork' AND target_id = p_artwork_id::text),
    (SELECT count(*)::int FROM favorites WHERE target_type = 'artwork' AND target_id = p_artwork_id::text)
  )
  ON CONFLICT (artwork_id)
  DO UPDATE SET
    likes = EXCLUDED.likes,
    favorites = EXCLUDED.favorites,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION set_node2_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'verifications',
    'events',
    'event_applications',
    'business_profiles',
    'opportunities',
    'opportunity_applications',
    'cooperation_projects',
    'artist_profiles',
    'artworks'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_node2_updated_at()',
      tbl,
      tbl
    );
  END LOOP;
END
$$;

NOTIFY pgrst, 'reload schema';
