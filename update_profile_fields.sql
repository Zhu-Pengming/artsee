-- 添加用户画像相关字段
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS interested_categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_interested_categories 
ON user_profiles USING GIN(interested_categories);

CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding 
ON user_profiles(has_completed_onboarding);
