#!/usr/bin/env node
/**
 * 查找 saved_schools 表中包含 aux- 前缀的无效记录
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

dotenv.config({ path: join(rootDir, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少环境变量：SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findInvalidSavedSchools() {
  console.log('🔍 查找包含 aux- 前缀的 saved_schools 记录...\n');

  const { data, error } = await supabase
    .from('saved_schools')
    .select('id, user_id, school_id, saved_at');

  if (error) {
    console.error('❌ 查询失败:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('✅ saved_schools 表为空');
    return;
  }

  console.log(`📊 总记录数: ${data.length}\n`);

  // 在 JavaScript 中过滤包含 aux- 前缀的记录
  const invalidRecords = data.filter(record => 
    String(record.school_id).startsWith('aux-')
  );

  if (invalidRecords.length === 0) {
    console.log('✅ 没有找到包含 aux- 前缀的记录');
    return;
  }

  console.log(`❌ 发现 ${invalidRecords.length} 条无效记录:\n`);
  
  for (const record of invalidRecords) {
    console.log(`  - Saved School ID: ${record.id}`);
    console.log(`    User ID: ${record.user_id}`);
    console.log(`    School ID: ${record.school_id}`);
    console.log(`    Saved At: ${record.saved_at}\n`);
  }

  console.log('\n💡 这些记录需要被删除或更新为有效的 UUID');
  console.log('   原因：aux- 前缀的 ID 是本地 CSV 辅助数据，不应保存到数据库');
}

findInvalidSavedSchools().catch(console.error);
