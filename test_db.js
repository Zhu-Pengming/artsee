const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nufrgmlhlfmhxsqbybfd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZnJnbWxobGZtaHhzcWJ5YmZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMDY0NSwiZXhwIjoyMDg5NTA2NjQ1fQ._eDbIZJ9RhEGKxVU4vtO93cCWe3wb-Dn3_ClExc8Bf0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAndSetup() {
  console.log('='.repeat(60));
  console.log('🔌 测试 Supabase 数据库连接');
  console.log('='.repeat(60));
  console.log('URL:', supabaseUrl);
  console.log();
  
  try {
    // 1. 测试连接
    const { data: testData, error: testError } = await supabase.auth.getSession();
    if (testError) {
      console.log('❌ 连接失败:', testError.message);
      return;
    }
    console.log('✅ 连接成功!');
    console.log();
    
    // 2. 检查表是否存在
    console.log('📊 检查现有表...');
    const tables = ['schools', 'art_categories', 'programs', 'program_admissions', 'program_fees', 'program_evaluations', 'program_art_categories'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error && error.code === '42P01') {
        console.log('  ❌', table, '- 表不存在');
      } else if (error) {
        console.log('  ⚠️ ', table, '-', error.message);
      } else {
        console.log('  ✅', table, '- 存在');
      }
    }
    console.log();
    
    // 3. 测试查询 schools 表
    console.log('🔍 测试查询 schools 表...');
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .limit(3);
    
    if (schoolsError) {
      console.log('  ❌ 查询失败:', schoolsError.message);
    } else {
      console.log('  ✅ 查询成功');
      console.log('  数据条数:', schools.length);
      if (schools.length > 0) {
        schools.forEach(s => {
          console.log('    -', s.name_zh, '(', s.country, ')');
        });
      }
    }
    console.log();
    
    // 4. 测试查询 programs 关联 schools
    console.log('🔍 测试关联查询 (programs + schools)...');
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('*, schools:school_key(name_zh, country)')
      .limit(3);
    
    if (programsError) {
      console.log('  ❌ 查询失败:', programsError.message);
    } else {
      console.log('  ✅ 关联查询成功');
      console.log('  数据条数:', programs.length);
      if (programs.length > 0) {
        programs.forEach(p => {
          console.log('    -', p.program_name, '@', p.schools?.name_zh);
        });
      }
    }
    console.log();
    
    // 5. 测试分类关联查询
    console.log('🔍 测试分类关联查询...');
    const { data: catRelations, error: catError } = await supabase
      .from('program_art_categories')
      .select('program_key, programs:program_key(program_name), categories:category_key(name_zh)')
      .limit(3);
    
    if (catError) {
      console.log('  ❌ 查询失败:', catError.message);
    } else {
      console.log('  ✅ 关联查询成功');
      console.log('  数据条数:', catRelations.length);
      if (catRelations.length > 0) {
        catRelations.forEach(r => {
          console.log('    -', r.programs?.program_name, '->', r.categories?.name_zh);
        });
      }
    }
    
  } catch (err) {
    console.log('❌ 错误:', err.message);
  }
  
  console.log();
  console.log('='.repeat(60));
  console.log('✅ 数据库测试完成');
  console.log('='.repeat(60));
}

testAndSetup();
