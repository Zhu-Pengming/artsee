-- Defensive performance indexes for high-traffic read paths.
-- These checks keep the migration safe even if older environments have not
-- replayed every historical core-table migration locally.

DO $$
BEGIN
  IF to_regclass('public.schools') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'schools'
        AND column_name = 'qs_art_design_rank'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_schools_status_rank ON schools (status, qs_art_design_rank);
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'schools'
        AND column_name = 'qs_art_rank'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_schools_status_rank ON schools (status, qs_art_rank);
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'schools'
        AND column_name = 'raw_country'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_schools_country_city ON schools (raw_country, city);
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'schools'
        AND column_name = 'country'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_schools_country_city ON schools (country, city);
    END IF;
  END IF;

  IF to_regclass('public.programs') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'programs'
        AND column_name = 'status'
    ) AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'programs'
        AND column_name = 'created_at'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_programs_status_created ON programs (status, created_at DESC);
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'programs'
        AND column_name = 'school_id'
    ) AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'programs'
        AND column_name = 'status'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_programs_school_status ON programs (school_id, status);
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'programs'
        AND column_name = 'normalized_degree_type'
    ) AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'programs'
        AND column_name = 'status'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_programs_degree_status ON programs (normalized_degree_type, status);
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'programs'
        AND column_name = 'raw_degree_type'
    ) AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'programs'
        AND column_name = 'status'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_programs_degree_status ON programs (raw_degree_type, status);
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'programs'
        AND column_name = 'degree_type'
    ) AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'programs'
        AND column_name = 'status'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_programs_degree_status ON programs (degree_type, status);
    END IF;
  END IF;

  IF to_regclass('public.cases') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_cases_status_created ON cases (status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_cases_author_created ON cases (author_id, created_at DESC);
  END IF;

  IF to_regclass('public.posts') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts (status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts (author_id, created_at DESC);
  END IF;

  IF to_regclass('public.community_posts') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_community_posts_status_created ON community_posts (status, created_at DESC);
  END IF;

  IF to_regclass('public.user_favorites') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_user_favorites_user_created ON user_favorites (user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_user_favorites_user_program ON user_favorites (user_id, program_id);
  END IF;
END
$$;

NOTIFY pgrst, 'reload schema';
