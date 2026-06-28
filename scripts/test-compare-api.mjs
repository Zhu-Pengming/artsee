#!/usr/bin/env node
/**
 * 测试院校对比 API
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

dotenv.config({ path: join(rootDir, '.env') });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003';
const TEST_TOKEN = process.env.TEST_USER_TOKEN; // 需要一个有效的 JWT token

async function testCompareAPI() {
  console.log('🧪 测试院校对比 API\n');
  console.log(`API Base: ${API_BASE}\n`);

  // 测试用例 1: 有效的 UUID
  const validSchoolIds = [
    '3485e258-d84b-4067-b093-62a3d468ac62', // 韩国艺术综合学校
    '39fd2bc9-ca11-4256-947d-e982e941243e', // 加州州立大学北岭分校
  ];

  console.log('测试 1: 有效的 UUID');
  console.log('School IDs:', validSchoolIds);
  
  try {
    const response = await fetch(`${API_BASE}/api/v1/schools/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TEST_TOKEN ? { 'Authorization': `Bearer ${TEST_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        school_ids: validSchoolIds,
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
    console.log();
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    console.log();
  }

  // 测试用例 2: 包含无效 ID
  const invalidSchoolIds = [
    '3485e258-d84b-4067-b093-62a3d468ac62',
    'aux-parsons', // 无效的 ID
  ];

  console.log('测试 2: 包含无效 ID');
  console.log('School IDs:', invalidSchoolIds);
  
  try {
    const response = await fetch(`${API_BASE}/api/v1/schools/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TEST_TOKEN ? { 'Authorization': `Bearer ${TEST_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        school_ids: invalidSchoolIds,
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log();
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    console.log();
  }
}

testCompareAPI().catch(console.error);
