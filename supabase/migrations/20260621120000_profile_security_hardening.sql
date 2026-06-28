-- Harden profile role/entitlement fields against direct authenticated-client updates.
-- Business logic should update these fields through Next.js BFF routes using service_role.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can insert profiles" ON public.user_profiles;
CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update profiles" ON public.user_profiles;
CREATE POLICY "Service role can update profiles"
  ON public.user_profiles FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read profiles" ON public.user_profiles;
CREATE POLICY "Service role can read profiles"
  ON public.user_profiles FOR SELECT
  TO service_role
  USING (true);

CREATE OR REPLACE FUNCTION public.prevent_user_profiles_sensitive_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
    OR NEW.user_type IS DISTINCT FROM OLD.user_type
    OR NEW.user_role IS DISTINCT FROM OLD.user_role
    OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
    OR NEW.membership_status IS DISTINCT FROM OLD.membership_status
    OR NEW.membership_started_at IS DISTINCT FROM OLD.membership_started_at
    OR NEW.membership_expires_at IS DISTINCT FROM OLD.membership_expires_at
    OR NEW.status IS DISTINCT FROM OLD.status
    OR NEW.admin_note IS DISTINCT FROM OLD.admin_note
    OR NEW.creator_level IS DISTINCT FROM OLD.creator_level
    OR NEW.creator_score IS DISTINCT FROM OLD.creator_score
    OR NEW.content_count IS DISTINCT FROM OLD.content_count
  THEN
    RAISE EXCEPTION 'profile sensitive fields can only be updated by service role';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_user_profiles_sensitive_update
  ON public.user_profiles;

CREATE TRIGGER trg_prevent_user_profiles_sensitive_update
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_user_profiles_sensitive_update();
