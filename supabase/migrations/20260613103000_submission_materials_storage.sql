-- Storage bucket for review resubmission materials.
-- Object path convention: `{user_id}/submission-materials/{content_type}/{content_id}/{timestamp}_{filename}`.

INSERT INTO storage.buckets (id, name, public)
VALUES ('submission-materials', 'submission-materials', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read submission materials" ON storage.objects;
DROP POLICY IF EXISTS "Users read own submission materials" ON storage.objects;
CREATE POLICY "Users read own submission materials"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'submission-materials'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Admins read submission materials" ON storage.objects;
CREATE POLICY "Admins read submission materials"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'submission-materials'
    AND EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users insert own submission materials" ON storage.objects;
CREATE POLICY "Users insert own submission materials"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'submission-materials'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users update own submission materials" ON storage.objects;
CREATE POLICY "Users update own submission materials"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'submission-materials'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'submission-materials'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users delete own submission materials" ON storage.objects;
CREATE POLICY "Users delete own submission materials"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'submission-materials'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
