#!/usr/bin/env tsx
/**
 * Test Phase 4 Features
 * 
 * Tests:
 * - P4.1: SQL Router for hard_data queries
 * - P4.2: Multi-hop retrieval for school_fit_analysis
 * 
 * Usage:
 *   npm run test:phase4
 */

import { config } from 'dotenv';
import { executeStructuredQuery } from '../lib/tools/structured-queries';
import { runSchoolFitAnalysis } from '../lib/pipelines/school-fit-pipeline';

config({ path: '.env.local' });

async function testSQLRouter() {
  console.log('\n🔍 Testing P4.1: SQL Router\n');
  console.log('='.repeat(80));

  const testQueries = [
    'RCA学费多少',
    '皇艺纯艺研究生一年要多少钱啊',
    'parsons申请截止日期',
    'csm排名',
    '伦艺官网',
  ];

  for (const query of testQueries) {
    console.log(`\n📝 Query: "${query}"`);
    
    try {
      const result = await executeStructuredQuery(query);
      
      if (result.usedSQL) {
        console.log('   ✅ SQL Router succeeded');
        console.log(`   Answer: ${result.answer?.substring(0, 100)}...`);
      } else {
        console.log('   ⚠️  Fallback to vector retrieval');
      }
    } catch (error) {
      console.error('   ❌ Error:', error);
    }
    
    console.log('-'.repeat(80));
  }
}

async function testMultiHopRetrieval() {
  console.log('\n\n🔍 Testing P4.2: Multi-hop Retrieval\n');
  console.log('='.repeat(80));

  const testCases = [
    {
      query: '我作品偏商业能申rca纯艺吗',
      schoolSlug: 'royal-college-art',
      userProfile: {
        portfolio_style_tendency: ['商业', '实验性'],
        target_degree: 'master',
      },
    },
    {
      query: '你觉得rca交互适合我吗',
      schoolSlug: 'royal-college-art',
      userProfile: {
        portfolio_style_tendency: ['交互', '科技'],
        target_majors: ['交互设计'],
      },
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Query: "${testCase.query}"`);
    console.log(`   School: ${testCase.schoolSlug}`);
    console.log(`   Profile: ${JSON.stringify(testCase.userProfile)}`);
    
    try {
      const result = await runSchoolFitAnalysis(
        testCase.query,
        testCase.schoolSlug,
        testCase.userProfile as any,
        {
          matchThreshold: 0.35,
          topK: 5,
        }
      );
      
      console.log(`\n   ✅ Multi-hop retrieval succeeded`);
      console.log(`   Total retrieved: ${result.totalRetrieved} chunks`);
      console.log(`   Merged to: ${result.chunks.length} chunks`);
      console.log(`   Plan steps: ${result.plan.length}`);
      
      result.plan.forEach((step, i) => {
        console.log(`     ${i + 1}. ${step.description} (k=${step.k})`);
      });
      
      if (result.chunks.length > 0) {
        console.log(`\n   Top chunks:`);
        result.chunks.slice(0, 3).forEach((chunk, i) => {
          console.log(`     ${i + 1}. ${chunk.headingPath} (sim: ${chunk.similarity.toFixed(3)})`);
        });
      }
    } catch (error) {
      console.error('   ❌ Error:', error);
    }
    
    console.log('-'.repeat(80));
  }
}

async function main() {
  console.log('🧪 Phase 4 Feature Tests\n');
  
  try {
    await testSQLRouter();
    await testMultiHopRetrieval();
    
    console.log('\n\n✅ All tests complete');
  } catch (error) {
    console.error('\n\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
