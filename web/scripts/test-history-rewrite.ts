#!/usr/bin/env tsx
/**
 * Test history rewriting functionality
 */

import { rewriteQueryWithHistory } from '../lib/memory/history-rewrite';

async function testHistoryRewrite() {
  console.log('🧪 Testing History Rewrite\n');

  // Test 1: Query needs context (pronoun)
  console.log('Test 1: Query with pronoun');
  const test1 = await rewriteQueryWithHistory(
    '那作品集呢？',
    [
      { role: 'user', content: '皇艺纯艺研究生学费多少' },
      { role: 'assistant', content: '约31,350至39,750英镑每年' },
    ]
  );
  console.log(`  Original: "那作品集呢？"`);
  console.log(`  Rewritten: "${test1.rewrittenQuery}"`);
  console.log(`  Was rewritten: ${test1.rewritten}\n`);

  // Test 2: Query doesn't need context (self-contained)
  console.log('Test 2: Self-contained query');
  const test2 = await rewriteQueryWithHistory(
    '皇艺纯艺研究生学费多少',
    []
  );
  console.log(`  Original: "皇艺纯艺研究生学费多少"`);
  console.log(`  Rewritten: "${test2.rewrittenQuery}"`);
  console.log(`  Was rewritten: ${test2.rewritten}\n`);

  // Test 3: Query with demonstrative
  console.log('Test 3: Query with demonstrative');
  const test3 = await rewriteQueryWithHistory(
    '这个学校的申请难度大吗？',
    [
      { role: 'user', content: '中央圣马丁时装设计怎么样' },
      { role: 'assistant', content: '中央圣马丁（CSM）的时装设计专业是全球顶尖的' },
    ]
  );
  console.log(`  Original: "这个学校的申请难度大吗？"`);
  console.log(`  Rewritten: "${test3.rewrittenQuery}"`);
  console.log(`  Was rewritten: ${test3.rewritten}\n`);

  // Test 4: Very short query
  console.log('Test 4: Very short query');
  const test4 = await rewriteQueryWithHistory(
    '呢？',
    [
      { role: 'user', content: 'Parsons作品集要求' },
      { role: 'assistant', content: 'Parsons作品集通常需要10-20件作品' },
    ]
  );
  console.log(`  Original: "呢？"`);
  console.log(`  Rewritten: "${test4.rewrittenQuery}"`);
  console.log(`  Was rewritten: ${test4.rewritten}\n`);

  console.log('✅ All tests completed');
}

testHistoryRewrite().catch(console.error);
