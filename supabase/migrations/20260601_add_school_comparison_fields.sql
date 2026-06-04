-- 添加多维对比所需的新字段到 schools 表
-- Migration: 20260601_add_school_comparison_fields

-- 1. 添加 program_count 字段（专业数量）
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS program_count INTEGER DEFAULT 0;

-- 2. 规范化 tuition 字段（统一为数字，单位：美元/年）
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS tuition_usd_per_year INTEGER;

-- 3. 添加 portfolio_difficulty 评级（1-5，5 最难）
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS portfolio_difficulty INTEGER CHECK (portfolio_difficulty >= 1 AND portfolio_difficulty <= 5);

-- 4. 添加 acceptance_rate 录取率（0-100，百分比）
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS acceptance_rate DECIMAL(5,2) CHECK (acceptance_rate >= 0 AND acceptance_rate <= 100);

-- 5. 添加城市生活费指数（1-5，5 最贵）
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS city_cost_index INTEGER CHECK (city_cost_index >= 1 AND city_cost_index <= 5);

-- 6. 添加就业资源评级（1-5，5 最好）
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS career_resources_rating INTEGER CHECK (career_resources_rating >= 1 AND career_resources_rating <= 5);

-- 7. 添加专业覆盖标签（JSON 数组）
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS major_tags JSONB DEFAULT '[]'::jsonb;

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_schools_program_count ON schools(program_count);
CREATE INDEX IF NOT EXISTS idx_schools_acceptance_rate ON schools(acceptance_rate);
CREATE INDEX IF NOT EXISTS idx_schools_portfolio_difficulty ON schools(portfolio_difficulty);
CREATE INDEX IF NOT EXISTS idx_schools_major_tags ON schools USING GIN(major_tags);

-- 添加注释
COMMENT ON COLUMN schools.program_count IS '该校开设的艺术设计相关专业数量';
COMMENT ON COLUMN schools.tuition_usd_per_year IS '年学费（美元），国际生标准';
COMMENT ON COLUMN schools.portfolio_difficulty IS '作品集难度评级：1=基础，2=中等，3=中高，4=高，5=极高';
COMMENT ON COLUMN schools.acceptance_rate IS '录取率（百分比），越低越难录取';
COMMENT ON COLUMN schools.city_cost_index IS '所在城市生活费指数：1=低，2=中低，3=中等，4=中高，5=高';
COMMENT ON COLUMN schools.career_resources_rating IS '就业资源评级：1=一般，2=良好，3=优秀，4=卓越，5=顶尖';
COMMENT ON COLUMN schools.major_tags IS '专业覆盖标签，如 ["交互设计", "视觉传达", "纯艺术"]';

-- 注意：数据迁移和初始化请使用 scripts/seed-school-comparison-data.mjs 脚本
-- 这样可以避免在迁移中引用可能不存在的列
