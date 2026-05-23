-- Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role (API) to insert new profiles during signup
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.user_profiles;
CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

-- Allow service role to update profiles
DROP POLICY IF EXISTS "Service role can update profiles" ON public.user_profiles;
CREATE POLICY "Service role can update profiles"
  ON public.user_profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow service role to read all profiles
DROP POLICY IF EXISTS "Service role can read profiles" ON public.user_profiles;
CREATE POLICY "Service role can read profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

-- Note: Trigger removed - profile creation is now handled by API endpoints
-- The API will explicitly create user_profiles after auth user creation
