const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const SUPABASE_URL = 'https://nufrgmlhlfmhxsqbybfd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZnJnbWxobGZtaHhzcWJ5YmZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMDY0NSwiZXhwIjoyMDg5NTA2NjQ1fQ._eDbIZJ9RhEGKxVU4vtO93cCWe3wb-Dn3_ClExc8Bf0';

// 开发者测试账号配置
const DEV_PHONE = '13511679218';
const DEV_USER_DATA = {
  nickname: '开发管理员',
  avatar_url: null,
  role: 'admin',
  status: 'active',
  is_verified: true,
  user_type: 'admin',
};

async function createAdminUser() {
  console.log('='.repeat(70));
  console.log('🚀 创建开发者管理员账号');
  console.log('='.repeat(70));
  console.log();

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const fullPhone = `+86${DEV_PHONE}`;

  try {
    // 检查是否已存在该手机号的用户
    console.log('📱 检查现有用户...');
    const { data: existingLink, error: linkError } = await supabase
      .from('auth_provider_links')
      .select('user_id')
      .eq('provider', 'phone')
      .eq('provider_user_id', fullPhone)
      .single();

    if (linkError && linkError.code !== 'PGRST116') {
      console.error('❌ 查询用户失败:', linkError.message);
      return;
    }

    let userId;
    let isNewUser = false;

    if (existingLink) {
      // 已存在用户，更新为管理员角色
      userId = existingLink.user_id;
      console.log('✅ 找到现有用户:', userId);
      
      // 更新用户资料为管理员
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...DEV_USER_DATA,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ 更新用户资料失败:', updateError.message);
        return;
      }
      
      console.log('✅ 已更新为管理员角色');
    } else {
      // 创建新的管理员用户
      isNewUser = true;
      console.log('🆕 创建新用户...');
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        phone: fullPhone,
        phone_confirm: true,
        user_metadata: {
          phone: DEV_PHONE,
          country_code: '+86',
          ...DEV_USER_DATA,
        },
      });

      if (createError || !newUser.user) {
        console.error('❌ 创建用户失败:', createError?.message || '未知错误');
        return;
      }

      userId = newUser.user.id;
      console.log('✅ 用户创建成功:', userId);

      // 创建 provider link
      const { error: linkInsertError } = await supabase.from('auth_provider_links').insert({
        user_id: userId,
        provider: 'phone',
        provider_user_id: fullPhone,
        is_primary: true,
      });

      if (linkInsertError) {
        console.error('❌ 创建provider link失败:', linkInsertError.message);
        return;
      }

      // 更新 user_profiles 为管理员
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({
          phone: DEV_PHONE,
          country_code: '+86',
          ...DEV_USER_DATA,
          last_login_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileUpdateError) {
        console.error('❌ 更新用户资料失败:', profileUpdateError.message);
        return;
      }
    }

    // 获取用户资料验证
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, phone, nickname, avatar_url, role, status, is_verified, user_type, last_login_at, created_at')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ 获取用户资料失败:', profileError.message);
      return;
    }

    console.log();
    console.log('='.repeat(70));
    console.log('✅ 开发者管理员账号', isNewUser ? '创建成功' : '更新成功');
    console.log('='.repeat(70));
    console.log();
    console.log('📋 账号信息:');
    console.log(`   手机号: ${DEV_PHONE}`);
    console.log(`   昵称: ${profile.nickname}`);
    console.log(`   角色: ${profile.role}`);
    console.log(`   用户类型: ${profile.user_type}`);
    console.log(`   用户ID: ${userId}`);
    console.log();
    console.log('🔑 登录方式:');
    console.log('   1. APP端: 点击"开发者一键登录"按钮');
    console.log('   2. API: POST /api/v1/auth/dev-login');
    console.log();
    console.log('⚠️  安全提示:');
    console.log('   此账号仅用于开发测试，请勿在生产环境使用');
    console.log();

  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

createAdminUser();
