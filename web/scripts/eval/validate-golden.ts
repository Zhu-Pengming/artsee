#!/usr/bin/env tsx
/**
 * Schema validator for golden.jsonl
 * 
 * Usage:
 *   npm run eval:validate
 * 
 * Checks:
 * 1. Required fields present
 * 2. Multi-turn questions have matching history length
 * 3. must_cite_chunk_ids exist in DB
 * 4. intent_expected is valid enum
 * 
 * Run this before eval:recall to catch errors early.
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { getSupabaseAdmin } from '../../lib/knowledge/supabase-admin';

// Load .env.local
config({ path: path.join(process.cwd(), '.env.local') });

interface GoldenItem {
  id: string;
  turns: number;
  question: string;
  intent_expected: string;
  must_cite_chunk_ids?: string[];
  reference_answer?: string;
  must_not_say?: string[];
  history?: Array<{ role: string; content: string }>;
}

const GOLDEN_PATH = path.join(process.cwd(), 'eval', 'golden.jsonl');

const VALID_INTENTS = [
  'hard_data',
  'open_info',
  'recommendation',
  'school_fit_analysis',
  'general_chat',
];

interface ValidationError {
  itemId: string;
  field: string;
  message: string;
}

async function loadGolden(): Promise<GoldenItem[]> {
  const content = await fs.readFile(GOLDEN_PATH, 'utf-8');
  return content
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line, idx) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid JSON at line ${idx + 1}: ${line}`);
      }
    });
}

function validateRequiredFields(item: GoldenItem): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!item.id || item.id.trim() === '') {
    errors.push({ itemId: item.id || '(unknown)', field: 'id', message: 'Missing or empty' });
  }

  if (typeof item.turns !== 'number' || item.turns < 1) {
    errors.push({ itemId: item.id, field: 'turns', message: 'Must be a number >= 1' });
  }

  if (!item.question || item.question.trim() === '') {
    errors.push({ itemId: item.id, field: 'question', message: 'Missing or empty' });
  }

  if (!item.intent_expected || item.intent_expected.trim() === '') {
    errors.push({ itemId: item.id, field: 'intent_expected', message: 'Missing or empty' });
  }

  return errors;
}

function validateIntent(item: GoldenItem): ValidationError[] {
  if (!VALID_INTENTS.includes(item.intent_expected)) {
    return [{
      itemId: item.id,
      field: 'intent_expected',
      message: `Invalid intent: "${item.intent_expected}". Valid: ${VALID_INTENTS.join(', ')}`,
    }];
  }
  return [];
}

function validateMultiTurn(item: GoldenItem): ValidationError[] {
  const errors: ValidationError[] = [];

  if (item.turns >= 2) {
    if (!item.history || !Array.isArray(item.history)) {
      errors.push({
        itemId: item.id,
        field: 'history',
        message: `Multi-turn question (turns=${item.turns}) must have history array`,
      });
    } else if (item.history.length !== (item.turns - 1) * 2) {
      errors.push({
        itemId: item.id,
        field: 'history',
        message: `History length mismatch: expected ${(item.turns - 1) * 2} messages (${item.turns - 1} user + ${item.turns - 1} assistant), got ${item.history.length}`,
      });
    } else {
      // Validate history structure
      for (let i = 0; i < item.history.length; i++) {
        const turn = item.history[i];
        if (!turn.role || !turn.content) {
          errors.push({
            itemId: item.id,
            field: `history[${i}]`,
            message: 'Missing role or content',
          });
        }
        if (turn.role !== 'user' && turn.role !== 'assistant') {
          errors.push({
            itemId: item.id,
            field: `history[${i}].role`,
            message: `Invalid role: "${turn.role}". Must be "user" or "assistant"`,
          });
        }
      }
    }
  } else if (item.turns === 1) {
    if (item.history && item.history.length > 0) {
      errors.push({
        itemId: item.id,
        field: 'history',
        message: 'Single-turn question should not have history',
      });
    }
  }

  return errors;
}

async function validateChunkIds(items: GoldenItem[]): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  
  // Collect all chunk IDs
  const allChunkIds = new Set<string>();
  const itemChunkMap = new Map<string, string[]>();

  for (const item of items) {
    if (item.must_cite_chunk_ids && item.must_cite_chunk_ids.length > 0) {
      itemChunkMap.set(item.id, item.must_cite_chunk_ids);
      item.must_cite_chunk_ids.forEach((id) => allChunkIds.add(id));
    }
  }

  if (allChunkIds.size === 0) {
    return errors; // No chunk IDs to validate
  }

  // Check which IDs exist in DB
  const supabase = getSupabaseAdmin();
  const { data: existingChunks, error } = await supabase
    .from('document_chunks')
    .select('id')
    .in('id', Array.from(allChunkIds));

  if (error) {
    throw new Error(`Failed to query document_chunks: ${error.message}`);
  }

  const existingIds = new Set((existingChunks || []).map((c: any) => c.id));

  // Find missing IDs
  for (const [itemId, chunkIds] of itemChunkMap.entries()) {
    const missingIds = chunkIds.filter((id) => !existingIds.has(id));
    if (missingIds.length > 0) {
      errors.push({
        itemId,
        field: 'must_cite_chunk_ids',
        message: `Chunk IDs not found in DB: ${missingIds.join(', ')}`,
      });
    }
  }

  return errors;
}

async function main() {
  console.log('🔍 Validating golden.jsonl\n');

  let items: GoldenItem[];
  try {
    items = await loadGolden();
  } catch (error: any) {
    console.error(`❌ Failed to load golden.jsonl: ${error.message}`);
    process.exit(1);
  }

  console.log(`Loaded ${items.length} questions\n`);

  const allErrors: ValidationError[] = [];

  // Run all validations
  console.log('Checking required fields...');
  for (const item of items) {
    allErrors.push(...validateRequiredFields(item));
  }

  console.log('Checking intent values...');
  for (const item of items) {
    allErrors.push(...validateIntent(item));
  }

  console.log('Checking multi-turn structure...');
  for (const item of items) {
    allErrors.push(...validateMultiTurn(item));
  }

  console.log('Checking chunk IDs in database...');
  allErrors.push(...(await validateChunkIds(items)));

  // Report results
  console.log('\n' + '='.repeat(80));

  if (allErrors.length === 0) {
    console.log('✅ All validations passed!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total questions: ${items.length}`);
    console.log(`   Single-turn: ${items.filter((i) => i.turns === 1).length}`);
    console.log(`   Multi-turn: ${items.filter((i) => i.turns >= 2).length}`);
    console.log(`   With annotations: ${items.filter((i) => i.must_cite_chunk_ids && i.must_cite_chunk_ids.length > 0).length}`);
    console.log(`   With reference answers: ${items.filter((i) => i.reference_answer && i.reference_answer.trim() !== '').length}`);
    
    // Intent breakdown
    const intentCounts = new Map<string, number>();
    for (const item of items) {
      intentCounts.set(item.intent_expected, (intentCounts.get(item.intent_expected) || 0) + 1);
    }
    console.log(`\n📋 By intent:`);
    for (const [intent, count] of intentCounts.entries()) {
      console.log(`   ${intent}: ${count}`);
    }

    process.exit(0);
  } else {
    console.log(`❌ Found ${allErrors.length} validation errors:\n`);

    // Group by item
    const errorsByItem = new Map<string, ValidationError[]>();
    for (const error of allErrors) {
      if (!errorsByItem.has(error.itemId)) {
        errorsByItem.set(error.itemId, []);
      }
      errorsByItem.get(error.itemId)!.push(error);
    }

    for (const [itemId, errors] of errorsByItem.entries()) {
      console.log(`\n[${itemId}]`);
      for (const error of errors) {
        console.log(`  ❌ ${error.field}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('Fix these errors before running eval:recall');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
