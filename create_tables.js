const { Client } = require('pg');

// Supabase 连接信息
// 格式: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
// 使用 connection pooler 可以在 Project Settings -> Database 中找到

// 从环境变量构建连接字符串
const SUPABASE_URL = 'https://nufrgmlhlfmhxsqbybfd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZnJnbWxobGZtaHhzcWJ5YmZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMDY0NSwiZXhwIjoyMDg5NTA2NjQ1fQ._eDbIZJ9RhEGKxVU4vtO93cCWe3wb-Dn3_ClExc8Bf0';

// 提取 project ref
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

// 使用 IPv4 连接池
// 密码是 service_role_key 的前 20 个字符（如果是 JWT）
// 或者你需要在 Supabase Dashboard 中设置数据库密码
const connectionString = `postgresql://postgres:${SERVICE_ROLE_KEY}@db.${projectRef}.supabase.co:5432/postgres`;

// 或者使用连接池
const poolerConnectionString = `postgresql://postgres:${SERVICE_ROLE_KEY}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;

const SQL = `
-- ============================================
-- 1. 创建更新触发器函数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 2. schools - 学校表
-- ============================================
CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    name_zh VARCHAR(200) NOT NULL,
    name_en TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    school_type VARCHAR(50),
    qs_art_rank INTEGER,
    official_website VARCHAR(500),
    logo_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schools_country ON schools(country);
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);

DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. art_categories - 艺术分类表
-- ============================================
CREATE TABLE IF NOT EXISTS art_categories (
    id SERIAL PRIMARY KEY,
    name_zh VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    parent_id INTEGER REFERENCES art_categories(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 1,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON art_categories(parent_id);

DROP TRIGGER IF EXISTS update_art_categories_updated_at ON art_categories;
CREATE TRIGGER update_art_categories_updated_at BEFORE UPDATE ON art_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. programs - 项目表
-- ============================================
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    program_name VARCHAR(200) NOT NULL,
    degree_type VARCHAR(50),
    duration_months INTEGER,
    requires_portfolio BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_programs_school ON programs(school_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);

DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. program_admissions - 项目录取信息表
-- ============================================
CREATE TABLE IF NOT EXISTS program_admissions (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    ielts_overall DECIMAL(3,1),
    regular_deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id)
);

-- ============================================
-- 6. program_fees - 项目费用表
-- ============================================
CREATE TABLE IF NOT EXISTS program_fees (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    international_tuition_fee DECIMAL(12,2),
    currency_code VARCHAR(3) DEFAULT 'GBP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id)
);

-- ============================================
-- 7. program_evaluations - 项目评估表
-- ============================================
CREATE TABLE IF NOT EXISTS program_evaluations (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    application_difficulty_score VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id)
);

-- ============================================
-- 8. program_art_categories - 项目分类关联表
-- ============================================
CREATE TABLE IF NOT EXISTS program_art_categories (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES art_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id, category_id)
);

-- ============================================
-- 9. user_profiles - 用户资料扩展表
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    wechat_open_id VARCHAR(100) UNIQUE,
    language VARCHAR(10) DEFAULT 'zh-CN',
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_wechat ON user_profiles(wechat_open_id);

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. sms_verifications - 短信验证码表
-- ============================================
CREATE TABLE IF NOT EXISTS sms_verifications (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    verification_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_phone ON sms_verifications(phone);

-- ============================================
-- 11. user_favorites - 用户收藏表
-- ============================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

-- ============================================
-- 创建新用户时自动创建 profile
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, phone)
    VALUES (NEW.id, NEW.phone);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 插入示例数据
-- ============================================
INSERT INTO schools (name_zh, name_en, country, city, school_type, qs_art_rank, official_website, status) VALUES
    ('中央圣马丁艺术与设计学院', 'Central Saint Martins', '英国', '伦敦', '艺术学院', 2, 'https://www.arts.ac.uk/csm', 'active'),
    ('皇家艺术学院', 'Royal College of Art', '英国', '伦敦', '艺术学院', 1, 'https://www.rca.ac.uk', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO art_categories (name_zh, name_en, level, is_popular) VALUES
    ('平面设计', 'Graphic Design', 1, true),
    ('纯艺', 'Fine Art', 1, true),
    ('时尚设计', 'Fashion Design', 1, true)
ON CONFLICT DO NOTHING;
`;

async function createTables() {
  console.log('='.repeat(70));
  console.log('🚀 创建数据库表');
  console.log('='.repeat(70));
  console.log();

  // 获取数据库密码
  // Supabase 的 service_role_key 不能直接作为数据库密码使用
  // 需要在 Supabase Dashboard -> Project Settings -> Database 中查看连接字符串
  
  console.log('⚠️  请先在 Supabase Dashboard 中获取数据库密码');
  console.log('步骤:');
  console.log('1. 打开 https://app.supabase.com/project/nufrgmlhlfmhxsqbybfd/settings/database');
  console.log('2. 复制 "Connection string" 或获取密码');
  console.log('3. 修改本脚本中的密码，然后重新运行');
  console.log();

  // 提示用户输入密码
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('请输入数据库密码 (或按 Ctrl+C 退出): ', async (password) => {
    const client = new Client({
      host: `db.${projectRef}.supabase.co`,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: password,
      ssl: {
        rejectUnauthorized: false
      }
    });

    try {
      console.log('🔌 连接数据库...');
      await client.connect();
      console.log('✅ 连接成功');
      console.log();

      console.log('📝 执行 SQL...');
      await client.query(SQL);
      console.log('✅ 表创建成功!');
      console.log();

      // 验证表是否创建
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      console.log('📊 已创建的表:');
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });

    } catch (err) {
      console.error('❌ 错误:', err.message);
      if (err.message.includes('password authentication failed')) {
        console.log('\n💡 密码错误，请检查密码是否正确');
      }
    } finally {
      await client.end();
      rl.close();
    }
  });
}

createTables();
