#!/usr/bin/env tsx
/**
 * Test LLM Intent Classification
 * 
 * Tests the LLM fallback for intent classification
 * 
 * Usage:
 *   npm run test:intent-llm
 */

import { config } from 'dotenv';
import { classifyIntent, classifyIntentEnhanced } from '../lib/ai/intent';

config({ path: '.env.local' });

const testQuestions = [
  // High confidence (should use rules)
  { q: 'RCA学费多少', expected: 'hard_data', useRule: true },
  { q: '皇艺纯艺怎么样啊', expected: 'open_info', useRule: true },
  { q: '我能申上RCA吗', expected: 'school_fit_analysis', useRule: true },
  
  // Low confidence (should use LLM)
  { q: '这个项目值得读吗', expected: 'open_info', useRule: false },
  { q: '我该选哪个', expected: 'recommendation', useRule: false },
  { q: '给我点建议', expected: 'application_advice', useRule: false },
];

async function main() {
  console.log('🧪 Testing Intent Classification\n');
  console.log('='.repeat(80));

  for (const test of testQuestions) {
    console.log(`\n📝 Question: "${test.q}"`);
    console.log(`   Expected: ${test.expected}`);
    console.log(`   Should use: ${test.useRule ? 'Rule-based' : 'LLM fallback'}`);

    // Test rule-based
    const ruleResult = classifyIntent(test.q);
    console.log(`\n   Rule-based result:`);
    console.log(`   - Intent: ${ruleResult.intent}`);
    console.log(`   - Confidence: ${ruleResult.confidence.toFixed(2)}`);

    // Test enhanced (with LLM fallback)
    console.log(`\n   Enhanced result (with LLM fallback):`);
    const enhancedResult = await classifyIntentEnhanced(test.q);
    console.log(`   - Intent: ${enhancedResult.intent}`);
    console.log(`   - Confidence: ${enhancedResult.confidence.toFixed(2)}`);

    // Check if it matches expected
    const match = enhancedResult.intent === test.expected ? '✅' : '❌';
    console.log(`\n   ${match} Match: ${enhancedResult.intent === test.expected}`);
    
    console.log('\n' + '-'.repeat(80));
  }

  console.log('\n✅ Test complete');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
