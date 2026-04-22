-- Artiqore 艺衡：Supabase Storage 公开桶 avatars + RLS
-- 路径约定：bucket `avatars` 内 object key = `{user_id}/avatar.{ext}`
-- 执行：Supabase Dashboard → SQL Editor，或 supabase db push

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 所有人可读（公开头像）
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 仅本人可在自己的 user_id 前缀下上传
DROP POLICY IF EXISTS "Users insert own avatar folder" ON storage.objects;
CREATE POLICY "Users insert own avatar folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (string_to_array(name, '/'))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (string_to_array(name, '/'))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (string_to_array(name, '/'))[1] = auth.uid()::text
  );
