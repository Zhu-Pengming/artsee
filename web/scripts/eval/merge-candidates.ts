#!/usr/bin/env tsx
/**
 * Interactive tool to merge pre-browsed candidates into golden.jsonl
 * 
 * Usage:
 *   npm run eval:merge-candidates
 * 
 * For each question with candidates:
 * 1. Show top candidates with path preview
 * 2. User selects chunk IDs (e.g., "1,3" or "skip kb-missing")
 * 3. Update golden.jsonl with must_cite_chunk_ids
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

const GOLDEN_PATH = path.join(process.cwd(), 'eval', 'golden.jsonl');
const CANDIDATES_DIR = path.join(process.cwd(), 'eval', 'candidates');

interface GoldenItem {
  id: string;
  turns: number;
  question: string;
  intent_expected: string;
  must_cite_chunk_ids?: string[];
  reference_answer?: string;
  must_not_say?: string[];
  history?: Array<{ role: string; content: string }>;
  note?: string;
  skip_reason?: string;
}

interface ChunkCandidate {
  chunk_id: string;
  path: string;
  text_preview: string;
  matched_keywords: string[];
}

async function loadGolden(): Promise<GoldenItem[]> {
  const content = await fs.readFile(GOLDEN_PATH, 'utf-8');
  return content
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

async function saveGolden(items: GoldenItem[]): Promise<void> {
  const content = items.map((item) => JSON.stringify(item)).join('\n') + '\n';
  await fs.writeFile(GOLDEN_PATH, content, 'utf-8');
}

async function loadCandidates(questionId: string): Promise<ChunkCandidate[]> {
  const filePath = path.join(CANDIDATES_DIR, `${questionId}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function formatPath(pathStr: string, maxLength: number = 80): string {
  if (pathStr.length <= maxLength) return pathStr;
  const parts = pathStr.split(' > ');
  if (parts.length <= 2) return pathStr.substring(0, maxLength) + '...';
  return parts[0] + ' > ... > ' + parts[parts.length - 1];
}

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function processQuestion(item: GoldenItem, candidates: ChunkCandidate[]): Promise<boolean> {
  console.log('\n' + '='.repeat(80));
  console.log(`📝 ${item.id}: ${item.question}`);
  console.log(`Intent: ${item.intent_expected} | Note: ${item.note || 'N/A'}`);
  
  // Check if already annotated
  if (item.must_cite_chunk_ids && item.must_cite_chunk_ids.length > 0) {
    console.log(`✅ Already annotated with ${item.must_cite_chunk_ids.length} chunk(s)`);
    const answer = await askQuestion('Skip this question? (y/n): ');
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' || answer === '') {
      return false;
    }
  }

  if (item.skip_reason) {
    console.log(`⚠️  Already skipped: ${item.skip_reason}`);
    const answer = await askQuestion('Re-annotate? (y/n): ');
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      return false;
    }
  }

  if (candidates.length === 0) {
    console.log('⚠️  No candidates found');
    const answer = await askQuestion('Skip reason (kb-missing/defer/bad-question) or press Enter to skip: ');
    if (answer) {
      item.must_cite_chunk_ids = [];
      item.skip_reason = answer;
      delete item.reference_answer;
      return true;
    }
    return false;
  }

  console.log(`\nFound ${candidates.length} candidates (showing top 10):\n`);
  
  const displayCount = Math.min(10, candidates.length);
  for (let i = 0; i < displayCount; i++) {
    const c = candidates[i];
    const pathParts = c.path.split(' > ');
    const lastPart = pathParts[pathParts.length - 1] || '(root)';
    const keywords = c.matched_keywords.slice(0, 3).join(', ');
    
    console.log(`[${i + 1}] ${lastPart}`);
    console.log(`    Path: ${formatPath(c.path, 76)}`);
    console.log(`    Keywords: ${keywords}`);
    console.log(`    Preview: ${c.text_preview.substring(0, 100).replace(/\n/g, ' ')}...`);
    console.log('');
  }

  const answer = await askQuestion(
    'Select chunks (e.g., "1,3" or "skip kb-missing" or "q" to quit): '
  );

  if (answer.toLowerCase() === 'q' || answer.toLowerCase() === 'quit') {
    return false;
  }

  if (answer.toLowerCase().startsWith('skip')) {
    const reason = answer.split(' ')[1] || 'kb-missing';
    item.must_cite_chunk_ids = [];
    item.skip_reason = reason;
    delete item.reference_answer;
    console.log(`✅ Skipped with reason: ${reason}`);
    return true;
  }

  if (!answer) {
    console.log('⏭️  Skipped (no input)');
    return false;
  }

  // Parse selection
  const indices = answer.split(',').map((s) => parseInt(s.trim()) - 1);
  const selectedIds: string[] = [];

  for (const idx of indices) {
    if (idx >= 0 && idx < candidates.length) {
      selectedIds.push(candidates[idx].chunk_id);
    } else {
      console.log(`⚠️  Invalid index: ${idx + 1}`);
    }
  }

  if (selectedIds.length === 0) {
    console.log('❌ No valid chunks selected');
    return false;
  }

  item.must_cite_chunk_ids = selectedIds;
  delete item.skip_reason;
  delete item.reference_answer;
  
  console.log(`✅ Selected ${selectedIds.length} chunk(s)`);
  return true;
}

async function main() {
  console.log('🚀 Interactive Candidate Merger\n');
  
  const items = await loadGolden();
  console.log(`Loaded ${items.length} questions from golden.jsonl\n`);

  let processed = 0;
  let skipped = 0;
  let quit = false;

  for (const item of items) {
    if (quit) break;

    const candidates = await loadCandidates(item.id);
    
    // Skip questions with no candidates and already marked as skip
    if (candidates.length === 0 && item.skip_reason) {
      skipped++;
      continue;
    }

    // Skip questions already annotated (unless user wants to re-annotate)
    if (item.must_cite_chunk_ids && item.must_cite_chunk_ids.length > 0) {
      const hasAnswer = await processQuestion(item, candidates);
      if (!hasAnswer) {
        skipped++;
        continue;
      }
    } else {
      const hasAnswer = await processQuestion(item, candidates);
      if (!hasAnswer) {
        if (candidates.length === 0) {
          skipped++;
        }
        continue;
      }
    }

    processed++;
    
    // Save after each annotation
    await saveGolden(items);
    console.log(`💾 Saved to golden.jsonl`);
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✅ Processed: ${processed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📁 Updated: ${GOLDEN_PATH}`);
  
  if (processed > 0) {
    console.log('\n📝 Next steps:');
    console.log('1. Run: npm run eval:validate');
    console.log('2. Run: npm run eval:draft-answers');
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
