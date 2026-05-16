-- Bootstrap the new visual community feed from existing published forum posts.
-- IDs are reused across tables only for one-time de-duplication; the tables remain independent.
INSERT INTO public.community_posts (
  id,
  author_id,
  title,
  body,
  image_urls,
  status,
  like_count,
  comment_count,
  view_count,
  created_at,
  updated_at
)
SELECT
  id,
  author_id,
  title,
  content,
  '{}'::text[],
  status,
  COALESCE(like_count, 0),
  COALESCE(answer_count, 0),
  COALESCE(view_count, 0),
  created_at,
  COALESCE(updated_at, created_at)
FROM public.posts
WHERE status = 'published'
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
