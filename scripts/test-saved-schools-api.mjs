#!/usr/bin/env node
/**
 * 测试 /api/v1/me/saved-schools API 返回的数据结构
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

function normalizeSavedSchool(row) {
  const rawSchool = row.schools;
  const school = Array.isArray(rawSchool) ? rawSchool[0] : rawSchool;
  return {
    ...(school ?? {}),
    school_id: row.school_id,
    saved_school_id: row.id,
    saved_at: row.saved_at,
  };
}

async function testSavedSchoolsAPI() {
  console.log('🔍 测试 saved_schools API 返回的数据结构...\n');

  // 模拟 API 查询
  const { data, error } = await supabase
    .from('saved_schools')
    .select('id, school_id, saved_at, schools(*)')
    .limit(5);

  if (error) {
    console.error('❌ 查询失败:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('✅ saved_schools 表为空');
    return;
  }

  console.log(`📊 查询到 ${data.length} 条记录\n`);

  const normalized = data.map(normalizeSavedSchool);

  console.log('原始数据示例:');
  console.log(JSON.stringify(data[0], null, 2));
  console.log('\n标准化后数据示例:');
  console.log(JSON.stringify(normalized[0], null, 2));

  console.log('\n🔍 检查标准化后的数据...\n');

  for (let i = 0; i < normalized.length; i++) {
    const record = normalized[i];
    const issues = [];

    if (!record.id) {
      issues.push('缺少 id 字段');
    } else if (!UUID_REGEX.test(record.id)) {
      issues.push(`id 不是 UUID: ${record.id}`);
    }

    if (!record.school_id) {
      issues.push('缺少 school_id 字段');
    } else if (!UUID_REGEX.test(record.school_id)) {
      issues.push(`school_id 不是 UUID: ${record.school_id}`);
    }

    if (issues.length > 0) {
      console.log(`❌ 记录 ${i + 1} 有问题:`);
      console.log(`   Name: ${record.name_zh || record.name_en || '未知'}`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log();
    } else {
      console.log(`✅ 记录 ${i + 1}: ${record.name_zh || record.name_en || '未知'}`);
      console.log(`   id: ${record.id}`);
      console.log(`   school_id: ${record.school_id}`);
      console.log();
    }
  }
}

testSavedSchoolsAPI().catch(console.error);
