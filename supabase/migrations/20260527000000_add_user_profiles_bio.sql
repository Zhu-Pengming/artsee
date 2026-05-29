-- 为 user_profiles 表添加 bio 字段
-- 用于用户个人简介，申请准备度API需要此字段

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN bio TEXT;
        
        COMMENT ON COLUMN public.user_profiles.bio IS '用户个人简介';
    END IF;
END $$;
