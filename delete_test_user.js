const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://nufrgmlhlfmhxsqbybfd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZnJnbWxobGZtaHhzcWJ5YmZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMDY0NSwiZXhwIjoyMDg5NTA2NjQ1fQ._eDbIZJ9RhEGKxVU4vtO93cCWe3wb-Dn3_ClExc8Bf0';

const TEST_PHONE = '+8613511679218';

async function deleteTestUser() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  
  try {
    // 查找用户
    const { data: link } = await supabase
      .from('auth_provider_links')
      .select('user_id')
      .eq('provider', 'phone')
      .eq('provider_user_id', TEST_PHONE)
      .single();
    
    if (link) {
      console.log('找到用户:', link.user_id);
      
      // 删除用户（级联删除关联数据）
      const { error } = await supabase.auth.admin.deleteUser(link.user_id);
      
      if (error) {
        console.error('删除失败:', error.message);
      } else {
        console.log('✅ 测试用户已删除');
      }
    } else {
      console.log('未找到测试用户');
    }
  } catch (e) {
    console.error('错误:', e.message);
  }
}

deleteTestUser();
