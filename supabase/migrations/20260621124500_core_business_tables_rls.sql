-- Harden Node 2 business/content tables that were created before RLS was
-- consistently applied. BFF routes use the service role for privileged writes;
-- direct authenticated clients only get owner-scoped, low-risk access.

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'artist_profiles',
    'artworks',
    'artwork_stats',
    'business_profiles',
    'cooperation_projects',
    'event_applications',
    'event_checkins',
    'events',
    'favorites',
    'likes',
    'notifications',
    'opportunities',
    'opportunity_applications',
    'upload_files',
    'user_roles',
    'verifications'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_service_role_all', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      tbl || '_service_role_all',
      tbl
    );
  END LOOP;
END
$$;

DROP POLICY IF EXISTS "user_roles_select_own" ON user_roles;
CREATE POLICY "user_roles_select_own"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "verifications_select_own" ON verifications;
CREATE POLICY "verifications_select_own"
  ON verifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "verifications_insert_own_pending" ON verifications;
CREATE POLICY "verifications_insert_own_pending"
  ON verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND reviewer_id IS NULL
    AND reviewed_at IS NULL
  );

DROP POLICY IF EXISTS "events_select_published" ON events;
CREATE POLICY "events_select_published"
  ON events
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "events_select_own_created" ON events;
CREATE POLICY "events_select_own_created"
  ON events
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "event_applications_select_own" ON event_applications;
CREATE POLICY "event_applications_select_own"
  ON event_applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "event_applications_insert_own_pending" ON event_applications;
CREATE POLICY "event_applications_insert_own_pending"
  ON event_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "event_checkins_select_own" ON event_checkins;
CREATE POLICY "event_checkins_select_own"
  ON event_checkins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "business_profiles_select_own" ON business_profiles;
CREATE POLICY "business_profiles_select_own"
  ON business_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "business_profiles_insert_own_pending" ON business_profiles;
CREATE POLICY "business_profiles_insert_own_pending"
  ON business_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "opportunities_select_published" ON opportunities;
CREATE POLICY "opportunities_select_published"
  ON opportunities
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "opportunities_select_own_created" ON opportunities;
CREATE POLICY "opportunities_select_own_created"
  ON opportunities
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "opportunity_applications_select_own" ON opportunity_applications;
CREATE POLICY "opportunity_applications_select_own"
  ON opportunity_applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "opportunity_applications_insert_own_submitted" ON opportunity_applications;
CREATE POLICY "opportunity_applications_insert_own_submitted"
  ON opportunity_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'submitted'
  );

DROP POLICY IF EXISTS "cooperation_projects_select_participants" ON cooperation_projects;
CREATE POLICY "cooperation_projects_select_participants"
  ON cooperation_projects
  FOR SELECT
  TO authenticated
  USING (
    artist_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM business_profiles
      WHERE business_profiles.id = cooperation_projects.business_id
        AND business_profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "artist_profiles_select_published_or_own" ON artist_profiles;
CREATE POLICY "artist_profiles_select_published_or_own"
  ON artist_profiles
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "artist_profiles_insert_own_draft" ON artist_profiles;
CREATE POLICY "artist_profiles_insert_own_draft"
  ON artist_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status IN ('draft', 'hidden')
  );

DROP POLICY IF EXISTS "artist_profiles_update_own_non_published" ON artist_profiles;
CREATE POLICY "artist_profiles_update_own_non_published"
  ON artist_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND status IN ('draft', 'hidden')
  );

DROP POLICY IF EXISTS "artworks_select_public_or_own" ON artworks;
CREATE POLICY "artworks_select_public_or_own"
  ON artworks
  FOR SELECT
  TO anon, authenticated
  USING (
    (status = 'published' AND visibility = 'public')
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "artworks_select_platform_or_own" ON artworks;
CREATE POLICY "artworks_select_platform_or_own"
  ON artworks
  FOR SELECT
  TO authenticated
  USING (
    (status = 'published' AND visibility IN ('public', 'platform_only'))
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "artworks_insert_own_unpublished" ON artworks;
CREATE POLICY "artworks_insert_own_unpublished"
  ON artworks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status IN ('draft', 'reviewing')
  );

DROP POLICY IF EXISTS "artworks_update_own_unpublished" ON artworks;
CREATE POLICY "artworks_update_own_unpublished"
  ON artworks
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND status IN ('draft', 'reviewing', 'rejected', 'archived')
  );

DROP POLICY IF EXISTS "artwork_stats_select_public" ON artwork_stats;
CREATE POLICY "artwork_stats_select_public"
  ON artwork_stats
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM artworks
      WHERE artworks.id = artwork_stats.artwork_id
        AND artworks.status = 'published'
        AND artworks.visibility = 'public'
    )
  );

DROP POLICY IF EXISTS "artwork_stats_select_platform" ON artwork_stats;
CREATE POLICY "artwork_stats_select_platform"
  ON artwork_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM artworks
      WHERE artworks.id = artwork_stats.artwork_id
        AND artworks.status = 'published'
        AND artworks.visibility IN ('public', 'platform_only')
    )
  );

DROP POLICY IF EXISTS "favorites_select_own" ON favorites;
CREATE POLICY "favorites_select_own"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "favorites_insert_own" ON favorites;
CREATE POLICY "favorites_insert_own"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "favorites_delete_own" ON favorites;
CREATE POLICY "favorites_delete_own"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "likes_select_own" ON likes;
CREATE POLICY "likes_select_own"
  ON likes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "likes_insert_own" ON likes;
CREATE POLICY "likes_insert_own"
  ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "likes_delete_own" ON likes;
CREATE POLICY "likes_delete_own"
  ON likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "upload_files_select_own" ON upload_files;
CREATE POLICY "upload_files_select_own"
  ON upload_files
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "upload_files_insert_own" ON upload_files;
CREATE POLICY "upload_files_insert_own"
  ON upload_files
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
