-- 修复 user_profiles 表缺失的 onboarding 相关列
-- 执行方式：登录 Supabase Dashboard → SQL Editor → New query → 粘贴本脚本 → Run

-- 添加 onboarding 完成标记（若不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'has_completed_onboarding'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 添加感兴趣的艺术领域（若不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'interested_categories'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN interested_categories TEXT[] DEFAULT '{}'::TEXT[];
    END IF;
END $$;

-- 刷新 PostgREST schema cache（可选，通常自动刷新）
NOTIFY pgrst, 'reload schema';
