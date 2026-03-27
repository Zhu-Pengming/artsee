const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nufrgmlhlfmhxsqbybfd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZnJnbWxobGZtaHhzcWJ5YmZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMDY0NSwiZXhwIjoyMDg5NTA2NjQ1fQ._eDbIZJ9RhEGKxVU4vtO93cCWe3wb-Dn3_ClExc8Bf0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('='.repeat(70));
  console.log('🚀 Artsee 数据库设置');
  console.log('='.repeat(70));
  console.log();

  try {
    // 1. 创建更新触发器函数
    console.log('1️⃣  创建触发器函数...');
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    });
    if (funcError) console.log('   ℹ️  函数可能已存在:', funcError.message);
    else console.log('   ✅ 触发器函数创建成功');
    console.log();

    // 2. 测试创建 schools 表
    console.log('2️⃣  创建 schools 表...');
    const { error: schoolsError } = await supabase
      .from('schools')
      .select('count', { count: 'exact', head: true });
    
    if (schoolsError && schoolsError.code === '42P01') {
      // 表不存在，需要创建
      console.log('   ℹ️  表不存在，请在 Supabase Dashboard 执行 create_database_v2.sql');
    } else if (schoolsError) {
      console.log('   ❌ 错误:', schoolsError.message);
    } else {
      console.log('   ✅ schools 表已存在');
    }
    console.log();

    // 3. 测试 auth.users
    console.log('3️⃣  检查 auth.users 表...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.log('   ❌ 错误:', usersError.message);
    } else {
      console.log('   ✅ auth.users 可访问');
      console.log('   当前用户数:', users.users.length);
    }
    console.log();

    // 4. 测试插入示例数据到 schools
    console.log('4️⃣  测试插入示例数据...');
    const { data: insertData, error: insertError } = await supabase
      .from('schools')
      .upsert([
        { 
          name_zh: '中央圣马丁艺术与设计学院', 
          name_en: 'Central Saint Martins',
          country: '英国',
          city: '伦敦',
          school_type: '艺术学院',
          status: 'active'
        },
        { 
          name_zh: '皇家艺术学院', 
          name_en: 'Royal College of Art',
          country: '英国',
          city: '伦敦',
          school_type: '艺术学院',
          status: 'active'
        }
      ], { onConflict: 'id' })
      .select();
    
    if (insertError) {
      console.log('   ❌ 插入失败:', insertError.message);
    } else {
      console.log('   ✅ 示例数据插入成功');
      console.log('   插入记录数:', insertData?.length || 0);
    }
    console.log();

    // 5. 查询验证
    console.log('5️⃣  查询 schools 表...');
    const { data: schools, error: queryError } = await supabase
      .from('schools')
      .select('*')
      .limit(5);
    
    if (queryError) {
      console.log('   ❌ 查询失败:', queryError.message);
    } else {
      console.log('   ✅ 查询成功');
      console.log('   记录数:', schools.length);
      schools.forEach(s => {
        console.log(`      - ${s.name_zh} (${s.country})`);
      });
    }
    console.log();

    // 6. 检查 user_profiles 表
    console.log('6️⃣  检查 user_profiles 表...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true });
    
    if (profileError && profileError.code === '42P01') {
      console.log('   ℹ️  user_profiles 表不存在，需要创建');
    } else if (profileError) {
      console.log('   ❌ 错误:', profileError.message);
    } else {
      console.log('   ✅ user_profiles 表已存在');
    }
    console.log();

  } catch (err) {
    console.log('❌ 错误:', err.message);
  }

  console.log('='.repeat(70));
  console.log('✅ 检查完成');
  console.log('='.repeat(70));
  console.log();
  console.log('📋 下一步:');
  console.log('   1. 在 Supabase Dashboard SQL Editor 执行 create_database_v2.sql');
  console.log('   2. 配置微信登录 (如果需要)');
  console.log('   3. 配置短信服务商');
  console.log('   4. 测试登录注册流程');
}

setupDatabase();
