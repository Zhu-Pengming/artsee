#!/usr/bin/env node
/**
 * 检查 schools 表中的 id 字段是否都是有效的 UUID
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

async function checkSchools() {
  console.log('🔍 检查 schools 表中的数据...\n');

  const { data, error, count } = await supabase
    .from('schools')
    .select('id, name_zh, name_en, slug', { count: 'exact' })
    .limit(100);

  if (error) {
    console.error('❌ 查询失败:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('✅ schools 表为空');
    return;
  }

  console.log(`📊 总记录数: ${count} (显示前 ${data.length} 条)\n`);

  const invalidRecords = [];

  for (const record of data) {
    if (!UUID_REGEX.test(record.id)) {
      invalidRecords.push(record);
    }
  }

  if (invalidRecords.length === 0) {
    console.log('✅ 所有 id 都是有效的 UUID');
    console.log('\n示例记录:');
    console.log(data.slice(0, 3).map(r => ({
      id: r.id,
      name_zh: r.name_zh,
      name_en: r.name_en,
      slug: r.slug
    })));
  } else {
    console.log(`❌ 发现 ${invalidRecords.length} 条无效记录:\n`);
    for (const record of invalidRecords) {
      console.log(`  - ID: ${record.id} (无效)`);
      console.log(`    Name ZH: ${record.name_zh}`);
      console.log(`    Name EN: ${record.name_en}`);
      console.log(`    Slug: ${record.slug}\n`);
    }

    console.log('\n💡 建议：这些记录的 id 字段不是 UUID，可能是 slug 或其他标识符');
  }
}

checkSchools().catch(console.error);
