#!/usr/bin/env tsx
/**
 * Interactive chunk annotation tool for golden.jsonl
 *
 * Usage:
 *   npm run eval:annotate                       # Annotate all unannotated items
 *   npm run eval:annotate -- --browse rca       # Standalone browse mode (no annotation)
 *   npm run eval:annotate -- --browse rca port  # Browse with keyword filter
 *
 * In-loop commands (during annotation):
 *   1,3,7                       → mark chunks 1, 3, 7 as ground truth
 *   browse <slug> [keyword]     → list school chunks (optional keyword filter)
 *   lower                       → re-search with lower threshold (0.3)
 *   search <query>              → re-search with custom query
 *   skip <reason>               → skip; reason ∈ {kb-missing, defer, bad-question}
 *   quit                        → save and exit
 *
 * Convention: an item is "annotated" iff it has must_cite_chunk_ids OR skip_reason.
 * - must_cite_chunk_ids = [], skip_reason = "kb-missing"  → KB has no answer (real signal)
 * - must_cite_chunk_ids = [], skip_reason = "defer"        → come back later
 * - must_cite_chunk_ids = [...]                            → ground truth set
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { config } from 'dotenv';
import { searchKnowledge } from '../../lib/knowledge/retriever';
import { getSupabaseAdmin } from '../../lib/knowledge/supabase-admin';

config({ path: path.join(process.cwd(), '.env.local') });

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

type SkipReason = 'kb-missing' | 'defer' | 'bad-question';

interface GoldenItem {
  id: string;
  turns: number;
  question: string;
  intent_expected: string;
  must_cite_chunk_ids?: string[];
  skip_reason?: SkipReason;
  reference_answer?: string;
  must_not_say?: string[];
  history?: Array<{ role: string; content: string }>;
  note?: string;
}

interface Candidate {
  chunkId: string;
  chunkText: string;
  headingPath: string | null;
  similarity?: number; // only set for search results
}

type Source = 'search' | 'search-lower' | 'search-custom' | 'browse';

type Action =
  | { kind: 'select'; indices: number[] }
  | { kind: 'browse'; slug: string; keyword?: string }
  | { kind: 'lower' }
  | { kind: 'search'; query: string }
  | { kind: 'skip'; reason: SkipReason }
  | { kind: 'quit' }
  | { kind: 'unknown'; message: string };

// ──────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────

const GOLDEN_PATH = path.join(process.cwd(), 'eval', 'golden.jsonl');
const PREVIEW_LENGTH = 200;
const DEFAULT_THRESHOLD = 0.7;
const LOWER_THRESHOLD = 0.3;
const SEARCH_K = 15;
const BROWSE_HARD_CAP = 50;
const VALID_SKIP_REASONS = new Set<SkipReason>(['kb-missing', 'defer', 'bad-question']);

class QuitSignal extends Error {
  constructor() {
    super('User quit');
  }
}

// ──────────────────────────────────────────────────────────────────────────
// I/O
// ──────────────────────────────────────────────────────────────────────────

async function loadGolden(): Promise<GoldenItem[]> {
  try {
    const content = await fs.readFile(GOLDEN_PATH, 'utf-8');
    return content
      .trim()
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('⚠️  golden.jsonl not found, creating empty file...');
      await fs.mkdir(path.dirname(GOLDEN_PATH), { recursive: true });
      await fs.writeFile(GOLDEN_PATH, '', 'utf-8');
      return [];
    }
    throw error;
  }
}

async function saveGolden(items: GoldenItem[]): Promise<void> {
  const content = items.map((item) => JSON.stringify(item)).join('\n') + '\n';
  await fs.writeFile(GOLDEN_PATH, content, 'utf-8');
}

function askQuestion(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

// ──────────────────────────────────────────────────────────────────────────
// Candidate sources
// ──────────────────────────────────────────────────────────────────────────

async function runSearch(
  query: string,
  opts: { matchThreshold?: number; matchCount?: number } = {}
): Promise<Candidate[]> {
  // Cast to any in case searchKnowledge's SearchOptions type doesn't include
  // matchThreshold yet — it's referenced as a real param in lib/knowledge per PLAN.
  const results = await searchKnowledge(query, {
    matchCount: opts.matchCount ?? SEARCH_K,
    matchThreshold: opts.matchThreshold ?? DEFAULT_THRESHOLD,
  } as any);
  return (results as any[]).map((r) => ({
    chunkId: r.chunkId,
    chunkText: r.chunkText,
    headingPath: r.headingPath ?? null,
    similarity: r.similarity,
  }));
}

async function runBrowse(slug: string, keyword?: string): Promise<Candidate[]> {
  const supabase = getSupabaseAdmin();

  const { data: schools, error: schoolErr } = await supabase
    .from('schools')
    .select('id, name_en')
    .eq('slug', slug)
    .limit(1);

  if (schoolErr) {
    console.error(`❌ Error fetching school: ${schoolErr.message}`);
    return [];
  }
  if (!schools || schools.length === 0) {
    console.error(`❌ School not found: ${slug}`);
    return [];
  }

  const school = schools[0] as any;
  const filterTag = keyword ? ` | filter: "${keyword}"` : '';
  console.log(`📚 Browsing: ${school.name_en} (${slug})${filterTag}`);

  const { data: chunks, error: chunkErr } = await supabase
    .from('document_chunks')
    .select('id, chunk_text, heading_path, document_id, chunk_index')
    .eq('school_id', school.id)
    .order('document_id', { ascending: true })
    .order('chunk_index', { ascending: true });

  if (chunkErr) {
    console.error(`❌ Error fetching chunks: ${chunkErr.message}`);
    return [];
  }
  if (!chunks || chunks.length === 0) {
    console.log('⚠️  No chunks found for this school');
    return [];
  }

  let filtered: Candidate[] = (chunks as any[]).map((c) => ({
    chunkId: c.id,
    chunkText: c.chunk_text,
    headingPath: c.heading_path ?? null,
  }));

  if (keyword) {
    const kw = keyword.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.chunkText.toLowerCase().includes(kw) ||
        (c.headingPath?.toLowerCase().includes(kw) ?? false)
    );
    if (filtered.length === 0) {
      console.log(`⚠️  No chunks match keyword "${keyword}"`);
      return [];
    }
  }

  if (filtered.length > BROWSE_HARD_CAP) {
    console.log(
      `⚠️  ${filtered.length} chunks total — showing first ${BROWSE_HARD_CAP}. Use a keyword to narrow.`
    );
    filtered = filtered.slice(0, BROWSE_HARD_CAP);
  }

  return filtered;
}

// ──────────────────────────────────────────────────────────────────────────
// Display
// ──────────────────────────────────────────────────────────────────────────

function displayCandidates(candidates: Candidate[], source: Source): void {
  if (candidates.length === 0) {
    console.log('\n(no candidates currently — pick an action below)\n');
    return;
  }
  const tag =
    source === 'browse'
      ? 'browse'
      : source === 'search-lower'
      ? 'search@lower'
      : source === 'search-custom'
      ? 'search@custom'
      : 'search';
  console.log(`\n${candidates.length} chunks (${tag}):\n`);
  candidates.forEach((c, idx) => {
    const preview = c.chunkText.substring(0, PREVIEW_LENGTH).replace(/\s+/g, ' ');
    console.log(`[${idx + 1}] ${c.chunkId}`);
    if (c.similarity !== undefined) {
      console.log(`    Similarity: ${c.similarity.toFixed(3)}`);
    }
    console.log(`    Path: ${c.headingPath || '(root)'}`);
    console.log(`    Text: ${preview}${c.chunkText.length > PREVIEW_LENGTH ? '...' : ''}`);
    console.log('');
  });
}

function displayMenu(): void {
  console.log('Actions:');
  console.log('  1,3,7                     mark chunks as ground truth');
  console.log('  browse <slug> [keyword]   list school chunks (optional substring filter)');
  console.log('  lower                     re-search with lower threshold (0.3)');
  console.log('  search <query>            re-search with a custom query');
  console.log('  skip <reason>             reasons: kb-missing | defer | bad-question');
  console.log('  quit                      save progress and exit');
}

// ──────────────────────────────────────────────────────────────────────────
// Input parsing
// ──────────────────────────────────────────────────────────────────────────

function parseAction(input: string, candidatesLen: number): Action {
  const trimmed = input.trim();
  if (!trimmed) return { kind: 'unknown', message: 'Empty input — type "quit" to exit.' };

  // selection: digits and commas only
  if (/^[\d,\s]+$/.test(trimmed)) {
    const indices = trimmed
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    if (indices.length === 0) {
      return { kind: 'unknown', message: 'No valid indices parsed' };
    }
    if (candidatesLen === 0) {
      return {
        kind: 'unknown',
        message: 'No candidates to select from — use "browse" or "search" first',
      };
    }
    const invalid = indices.filter((n) => n < 1 || n > candidatesLen);
    if (invalid.length > 0) {
      return {
        kind: 'unknown',
        message: `Indices out of range: ${invalid.join(', ')} (valid: 1-${candidatesLen})`,
      };
    }
    return { kind: 'select', indices };
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const rest = parts.slice(1);

  switch (cmd) {
    case 'browse': {
      const slug = rest[0];
      const keyword = rest.slice(1).join(' ') || undefined;
      if (!slug) {
        return { kind: 'unknown', message: 'browse requires a school slug (e.g., "browse rca")' };
      }
      return { kind: 'browse', slug, keyword };
    }
    case 'lower':
      return { kind: 'lower' };
    case 'search': {
      const query = rest.join(' ');
      if (!query) return { kind: 'unknown', message: 'search requires a query' };
      return { kind: 'search', query };
    }
    case 'skip': {
      const reason = rest[0] as SkipReason | undefined;
      if (!reason || !VALID_SKIP_REASONS.has(reason)) {
        return {
          kind: 'unknown',
          message: `skip requires a reason: ${[...VALID_SKIP_REASONS].join(' | ')}`,
        };
      }
      return { kind: 'skip', reason };
    }
    case 'quit':
    case 'exit':
    case 'q':
      return { kind: 'quit' };
    default:
      return { kind: 'unknown', message: `Unknown command: "${cmd}"` };
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Main annotation loop
// ──────────────────────────────────────────────────────────────────────────

async function annotateItem(item: GoldenItem, rl: readline.Interface): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📝 Annotating: ${item.id}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Question: ${item.question}`);
  console.log(`Intent:   ${item.intent_expected}`);
  console.log(`Turns:    ${item.turns}`);
  if (item.note) console.log(`Note:     ${item.note}`);

  if (item.history && item.history.length > 0) {
    console.log('\nConversation history:');
    item.history.forEach((turn, idx) => {
      console.log(`  [${idx + 1}] ${turn.role}: ${turn.content}`);
    });
    console.log('\n⚠️  Multi-turn: searching with LAST question only (no history rewrite — baseline failure mode is the point).');
  }

  console.log(`\n🔍 Initial baseline search (threshold=${DEFAULT_THRESHOLD}, k=${SEARCH_K})...`);
  let candidates: Candidate[] = await runSearch(item.question);
  let source: Source = 'search';

  if (candidates.length === 0) {
    console.log(`\n⚠️  Baseline retrieved 0 chunks at threshold ${DEFAULT_THRESHOLD}.`);
    console.log('   This is a real baseline failure — but it does NOT mean ground truth is empty.');
    console.log('   Next: try "browse <slug>" or "lower" to find candidates.');
    console.log('   If KB truly has no answer: "skip kb-missing".');
  }

  while (true) {
    displayCandidates(candidates, source);
    displayMenu();
    const raw = await askQuestion(rl, '> ');
    const action = parseAction(raw, candidates.length);

    switch (action.kind) {
      case 'select': {
        item.must_cite_chunk_ids = action.indices.map((i) => candidates[i - 1].chunkId);
        delete item.skip_reason;
        console.log(`✅ Marked ${item.must_cite_chunk_ids.length} chunks as ground truth.`);
        return;
      }
      case 'browse': {
        candidates = await runBrowse(action.slug, action.keyword);
        source = 'browse';
        break;
      }
      case 'lower': {
        candidates = await runSearch(item.question, { matchThreshold: LOWER_THRESHOLD });
        source = 'search-lower';
        console.log(`(re-searched at threshold ${LOWER_THRESHOLD})`);
        break;
      }
      case 'search': {
        candidates = await runSearch(action.query);
        source = 'search-custom';
        console.log(`(re-searched with custom query: "${action.query}")`);
        break;
      }
      case 'skip': {
        item.must_cite_chunk_ids = [];
        item.skip_reason = action.reason;
        console.log(`⏭️  Skipped with reason: ${action.reason}`);
        return;
      }
      case 'quit': {
        throw new QuitSignal();
      }
      case 'unknown':
      default: {
        console.log(`❓ ${action.message}`);
        break;
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// CLI entry points
// ──────────────────────────────────────────────────────────────────────────

async function standaloneBrowse(slug: string, keyword?: string): Promise<void> {
  const candidates = await runBrowse(slug, keyword);
  displayCandidates(candidates, 'browse');
  console.log(`\n✅ Total: ${candidates.length} chunks`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--browse' && args[1]) {
    const slug = args[1];
    const keyword = args.slice(2).join(' ') || undefined;
    await standaloneBrowse(slug, keyword);
    return;
  }

  console.log('🚀 Golden Set Chunk Annotator\n');

  const items = await loadGolden();

  if (items.length === 0) {
    console.log('⚠️  golden.jsonl is empty. Please add questions first.');
    console.log('\nExample format:');
    console.log(
      JSON.stringify(
        {
          id: 'Q001',
          turns: 1,
          question: '皇艺纯艺研究生一年要多少钱啊',
          intent_expected: 'hard_data',
        },
        null,
        2
      )
    );
    return;
  }

  // "needs annotation" = neither must_cite_chunk_ids nor skip_reason has been touched.
  // Field-presence check (not truthiness) so that `must_cite_chunk_ids: []` (KB-missing case)
  // is correctly treated as already-annotated on re-run.
  const unannotated = items.filter(
    (item) => !('must_cite_chunk_ids' in item) && !('skip_reason' in item)
  );

  console.log(`Total questions:    ${items.length}`);
  console.log(`Already annotated:  ${items.length - unannotated.length}`);
  console.log(`Need annotation:    ${unannotated.length}\n`);

  if (unannotated.length === 0) {
    console.log('✅ All questions are already annotated!');
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let completed = 0;

  try {
    for (const item of unannotated) {
      await annotateItem(item, rl);
      await saveGolden(items);
      completed++;
      console.log('💾 Progress saved.\n');
    }
    console.log(`\n🎉 Annotation complete! (${completed}/${unannotated.length})`);
    console.log(`📁 Saved to: ${GOLDEN_PATH}`);
  } catch (err) {
    if (err instanceof QuitSignal) {
      await saveGolden(items);
      console.log(
        `\n👋 Quit. Progress saved: ${completed}/${unannotated.length} items annotated this session.`
      );
      console.log(`📁 ${GOLDEN_PATH}`);
    } else {
      throw err;
    }
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});