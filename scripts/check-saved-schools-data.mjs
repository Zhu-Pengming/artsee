#!/usr/bin/env node
/**
 * 检查 saved_schools 表中的 school_id 是否都是有效的 UUID
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function checkSavedSchools() {
  console.log('🔍 检查 saved_schools 表中的数据...\n');

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

  const invalidRecords = [];

  for (const record of data) {
    if (!UUID_REGEX.test(record.school_id)) {
      invalidRecords.push(record);
    }
  }

  if (invalidRecords.length === 0) {
    console.log('✅ 所有 school_id 都是有效的 UUID');
  } else {
    console.log(`❌ 发现 ${invalidRecords.length} 条无效记录:\n`);
    for (const record of invalidRecords) {
      console.log(`  - ID: ${record.id}`);
      console.log(`    User ID: ${record.user_id}`);
      console.log(`    School ID: ${record.school_id} (无效)`);
      console.log(`    Saved At: ${record.saved_at}\n`);
    }

    console.log('\n💡 建议：删除这些无效记录或更新为有效的 UUID');
  }
}

checkSavedSchools().catch(console.error);
