# Artsee 数据库设计 v2

## 设计原则

1. **去掉飞书 Key** - 使用自增 ID 作为主键
2. **统一认证** - 支持手机号、微信登录
3. **扩展用户资料** - 在 Supabase Auth 基础上扩展
4. **多平台适用** - Web 和 APP 共用同一套用户系统

## 表结构

### 核心业务表

```
┌─────────────────────────────────────────────────────────────────────┐
│                        数据库关系图                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   auth.users (Supabase) ◄── user_profiles (扩展资料)                  │
│          │                                                          │
│          ├─── user_favorites ───► programs ◄─── schools             │
│          │                              │                           │
│          └─── user_follows              ├─── program_admissions      │
│                                         ├─── program_fees            │
│                                         ├─── program_evaluations     │
│                                         └─── program_art_categories  │
│                                                      ▲               │
│                                                      │               │
│                                               art_categories         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1. schools - 学校表

```sql
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    name_zh VARCHAR(200) NOT NULL,
    name_en TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    school_type VARCHAR(50),
    qs_art_rank INTEGER,
    qs_architecture_rank INTEGER,
    qs_overall_rank INTEGER,
    school_tier VARCHAR(20),
    official_website VARCHAR(500),
    international_students_page VARCHAR(500),
    logo_url TEXT,
    campus_image_urls JSONB,
    founded_year INTEGER,
    description TEXT,
    feature_tags JSONB,
    strength_disciplines TEXT,
    notable_alumni TEXT,
    entry_score_requirements TEXT,
    annual_intake INTEGER,
    application_deadline DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. art_categories - 艺术分类表

```sql
CREATE TABLE art_categories (
    id SERIAL PRIMARY KEY,
    name_zh VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    parent_id INTEGER REFERENCES art_categories(id) ON DELETE SET NULL,
    category_code VARCHAR(50),
    level INTEGER DEFAULT 1,
    description TEXT,
    summary TEXT,
    popularity_score DECIMAL(5,2),
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. programs - 项目表

```sql
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    program_name VARCHAR(200) NOT NULL,
    degree_type VARCHAR(50),
    degree_full_name VARCHAR(200),
    program_category VARCHAR(100),
    program_code VARCHAR(50),
    ucas_code VARCHAR(50),
    duration_text TEXT,
    duration_months INTEGER,
    study_mode JSONB,
    intake_months JSONB,
    requires_portfolio BOOLEAN DEFAULT false,
    requires_interview BOOLEAN DEFAULT false,
    requires_personal_statement BOOLEAN DEFAULT false,
    minimum_education JSONB,
    program_overview TEXT,
    program_highlights TEXT,
    accreditation_info TEXT,
    core_courses TEXT,
    career_paths TEXT,
    admission_summary JSONB,
    cover_image_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    is_recommended BOOLEAN DEFAULT false,
    source_file VARCHAR(200),
    source_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 项目关联表

```sql
-- 录取信息
CREATE TABLE program_admissions (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    portfolio_requirements TEXT,
    portfolio_format JSONB,
    portfolio_deadline DATE,
    ielts_overall DECIMAL(3,1),
    ielts_subscores JSONB,
    toefl_ibt INTEGER,
    other_language_tests TEXT,
    interview_format JSONB,
    reference_count INTEGER,
    academic_requirements TEXT,
    regular_deadline DATE,
    priority_deadline DATE,
    deadline_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id)
);

-- 费用信息
CREATE TABLE program_fees (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    international_tuition_fee DECIMAL(12,2),
    domestic_tuition_fee DECIMAL(12,2),
    currency_code VARCHAR(3) DEFAULT 'GBP',
    additional_fees_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id)
);

-- 评估信息
CREATE TABLE program_evaluations (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    application_difficulty_score VARCHAR(20),
    competition_level VARCHAR(50),
    acceptance_rate DECIMAL(5,2),
    data_source VARCHAR(100),
    source_url TEXT,
    evidence_note TEXT,
    updated_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id)
);

-- 分类关联
CREATE TABLE program_art_categories (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES art_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id, category_id)
);
```

### 5. 用户认证相关表

```sql
-- 用户资料扩展 (关联 auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 基本信息
    nickname VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    country_code VARCHAR(10) DEFAULT '+86',
    
    -- 微信登录信息
    wechat_open_id VARCHAR(100) UNIQUE,
    wechat_union_id VARCHAR(100),
    wechat_nickname VARCHAR(100),
    wechat_avatar_url TEXT,
    
    -- 用户类型
    user_type VARCHAR(20) DEFAULT 'student', -- student, artist, admin
    
    -- 个人资料
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(200),
    
    -- 偏好设置
    language VARCHAR(10) DEFAULT 'zh-CN',
    theme VARCHAR(20) DEFAULT 'light',
    
    -- 统计
    following_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    artworks_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    
    -- 状态
    is_verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    
    -- 时间戳
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 短信验证码
CREATE TABLE sms_verifications (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    country_code VARCHAR(10) DEFAULT '+86',
    verification_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 第三方登录关联
CREATE TABLE auth_provider_links (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- wechat, phone, email
    provider_user_id VARCHAR(100) NOT NULL,
    provider_data JSONB,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

-- 用户收藏
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

-- 用户关注
CREATE TABLE user_follows (
    id SERIAL PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);
```

### 6. 自动创建 Profile 触发器

```sql
-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 7. RLS 安全策略

```sql
-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- user_profiles 策略
CREATE POLICY "Public profiles are viewable by everyone"
    ON user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- user_favorites 策略
CREATE POLICY "Users can view own favorites"
    ON user_favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
    ON user_favorites FOR ALL
    USING (auth.uid() = user_id);

-- user_follows 策略
CREATE POLICY "Users can view follows"
    ON user_follows FOR SELECT
    USING (true);

CREATE POLICY "Users can manage own follows"
    ON user_follows FOR ALL
    USING (auth.uid() = follower_id);
```

## 认证流程

### 手机号登录

```
1. 用户输入手机号
2. 后端生成验证码 -> sms_verifications 表
3. 发送短信
4. 用户输入验证码
5. 验证 -> 创建/获取 auth.users 记录
6. 创建 auth_provider_links (provider='phone')
7. 返回 JWT token
```

### 微信登录

```
1. APP/小程序调用微信 SDK 获取 code
2. 后端用 code 换取 openid 和 access_token
3. 查询 auth_provider_links (provider='wechat')
4. 如果存在 -> 登录
5. 如果不存在 -> 创建 auth.users
6. 创建 auth_provider_links
7. 更新 user_profiles (wechat_open_id, wechat_union_id)
8. 返回 JWT token
```

## 查询示例

### 查询项目完整信息

```sql
SELECT 
    p.id,
    p.program_name,
    p.degree_type,
    s.name_zh as school_name,
    s.country,
    pa.ielts_overall,
    pf.international_tuition_fee,
    pe.application_difficulty_score,
    ARRAY_AGG(ac.name_zh) as categories
FROM programs p
JOIN schools s ON p.school_id = s.id
LEFT JOIN program_admissions pa ON p.id = pa.program_id
LEFT JOIN program_fees pf ON p.id = pf.program_id
LEFT JOIN program_evaluations pe ON p.id = pe.program_id
LEFT JOIN program_art_categories pac ON p.id = pac.program_id
LEFT JOIN art_categories ac ON pac.category_id = ac.id
WHERE p.id = 1
GROUP BY p.id, s.name_zh, s.country, pa.ielts_overall, 
         pf.international_tuition_fee, pe.application_difficulty_score;
```

### 查询用户收藏

```sql
SELECT 
    uf.id as favorite_id,
    uf.note,
    uf.created_at as favorited_at,
    p.id as program_id,
    p.program_name,
    p.degree_type,
    s.name_zh as school_name
FROM user_favorites uf
JOIN programs p ON uf.program_id = p.id
JOIN schools s ON p.school_id = s.id
WHERE uf.user_id = 'user-uuid';
```

## 部署步骤

1. **执行 SQL**: 在 Supabase Dashboard SQL Editor 中执行 `create_database_v2.sql`
2. **配置 Auth Providers**: 关闭 Email 确认，启用 Phone (用于内部)
3. **配置微信**: 在微信开放平台注册应用，获取 AppID 和 Secret
4. **配置短信**: 接入阿里云/腾讯云短信服务
5. **测试**: Web 和 APP 分别测试登录流程

## 文件清单

- `init_data/create_database_v2.sql` - 完整建表脚本
- `AUTH_SYSTEM.md` - 认证系统详细文档
- `DATABASE_SCHEMA_V2.md` - 本文件
