ALTER TABLE artist_profiles DROP CONSTRAINT IF EXISTS artist_profiles_status_check;
ALTER TABLE artist_profiles
  ADD CONSTRAINT artist_profiles_status_check
  CHECK (status IN ('draft', 'reviewing', 'published', 'hidden', 'rejected', 'archived'));
