#!/usr/bin/env tsx
/**
 * Pre-browse candidate chunks for all golden questions
 * 
 * Usage:
 *   npm run eval:pre-browse
 * 
 * For each question in golden.jsonl:
 * 1. Extract school slug from question (皇艺 → royal-college-art)
 * 2. Extract keywords from note field + question
 * 3. Run 3-5 keyword combinations (CN/EN + synonyms)
 * 4. Dedupe and save to eval/candidates/q001.json
 * 
 * Output: eval/candidates/*.json (one per question)
 * Then you manually review and select ground truth chunks.
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { getSupabaseAdmin } from '../../lib/knowledge/supabase-admin';

// Load .env.local
config({ path: path.join(process.cwd(), '.env.local') });

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
}

interface ChunkCandidate {
  chunk_id: string;
  path: string;
  text_preview: string;
  matched_keywords: string[];
}

// School name mappings (CN/EN variants → slug)
const SCHOOL_MAPPINGS: Record<string, string> = {
  // RCA
  '皇艺': 'royal-college-art',
  '皇家艺术学院': 'royal-college-art',
  'rca': 'royal-college-art',
  'royal college of art': 'royal-college-art',
  
  // UAL
  'ual': 'university-arts-london',
  '伦艺': 'university-arts-london',
  '伦敦艺术大学': 'university-arts-london',
  'university of the arts london': 'university-arts-london',
  
  // CSM
  'csm': 'central-saint-martins',
  '中央圣马丁': 'central-saint-martins',
  'central saint martins': 'central-saint-martins',
  
  // Parsons
  'parsons': 'parsons-school-design',
  '帕森斯': 'parsons-school-design',
  'parsons school of design': 'parsons-school-design',
  
  // Pratt
  'pratt': 'pratt-institute',
  '普瑞特': 'pratt-institute',
  'pratt institute': 'pratt-institute',
  
  // RISD
  'risd': 'rhode-island-school-design',
  '罗德岛': 'rhode-island-school-design',
  'rhode island school of design': 'rhode-island-school-design',
  
  // SAIC
  'saic': 'school-art-institute-chicago',
  '芝加哥艺术学院': 'school-art-institute-chicago',
  'school of the art institute of chicago': 'school-art-institute-chicago',
  
  // CalArts
  'calarts': 'california-institute-arts',
  '加州艺术学院': 'california-institute-arts',
  'california institute of the arts': 'california-institute-arts',
  
  // SVA
  'sva': 'school-visual-arts',
  '纽约视觉艺术学院': 'school-visual-arts',
  'school of visual arts': 'school-visual-arts',
  
  // MIT
  'mit': 'massachusetts-institute-technology',
  '麻省理工': 'massachusetts-institute-technology',
  'massachusetts institute of technology': 'massachusetts-institute-technology',
  
  // Oxford
  'oxford': 'university-oxford',
  '牛津': 'university-oxford',
  '牛津大学': 'university-oxford',
  'university of oxford': 'university-oxford',
};

// Keyword synonyms (for expanding search)
const KEYWORD_SYNONYMS: Record<string, string[]> = {
  // Tuition
  '学费': ['学费', 'tuition', 'fee', '费用', 'cost'],
  'tuition': ['tuition', 'fee', '学费', 'cost'],
  
  // Deadline
  'ddl': ['deadline', 'ddl', '截止', '截止日期', 'due date'],
  'deadline': ['deadline', 'ddl', '截止', '截止日期'],
  '截止': ['截止', '截止日期', 'deadline', 'ddl'],
  
  // Portfolio
  '作品集': ['作品集', 'portfolio', '项目', 'project'],
  'portfolio': ['portfolio', '作品集', 'work sample'],
  
  // GPA
  'gpa': ['gpa', 'GPA', '绩点', 'grade point'],
  '绩点': ['绩点', 'gpa', 'GPA'],
  
  // Requirements
  '要求': ['要求', 'requirement', 'criteria', '条件'],
  'requirement': ['requirement', '要求', 'criteria'],
  
  // Application
  '申请': ['申请', 'application', 'apply', 'admission'],
  'application': ['application', '申请', 'admission'],
  
  // Major/Program
  '纯艺': ['纯艺', 'fine art', 'fine arts'],
  '插画': ['插画', 'illustration'],
  '服设': ['服设', '服装设计', 'fashion design', 'fashion'],
  '建筑': ['建筑', 'architecture'],
  '交互': ['交互', '交互设计', 'interaction design', 'ixd'],
};

async function loadGolden(): Promise<GoldenItem[]> {
  const content = await fs.readFile(GOLDEN_PATH, 'utf-8');
  return content
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

function extractSchoolSlug(question: string): string | null {
  const lowerQ = question.toLowerCase();
  
  // Try exact matches first (longer phrases first)
  const sortedKeys = Object.keys(SCHOOL_MAPPINGS).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    if (lowerQ.includes(key.toLowerCase())) {
      return SCHOOL_MAPPINGS[key];
    }
  }
  
  return null;
}

function extractKeywords(question: string, note?: string): string[] {
  const keywords: Set<string> = new Set();
  
  // Extract from note field
  if (note) {
    const noteWords = note.toLowerCase().split(/[,\s]+/);
    noteWords.forEach((word) => {
      if (word.length > 1) keywords.add(word);
    });
  }
  
  // Extract from question (common patterns)
  const patterns = [
    /学费|tuition|fee/gi,
    /截止|ddl|deadline/gi,
    /作品集|portfolio/gi,
    /gpa|绩点/gi,
    /要求|requirement/gi,
    /申请|application/gi,
    /纯艺|fine art/gi,
    /插画|illustration/gi,
    /服设|服装|fashion/gi,
    /建筑|architecture/gi,
    /交互|interaction/gi,
  ];
  
  patterns.forEach((pattern) => {
    const matches = question.match(pattern);
    if (matches) {
      matches.forEach((m) => keywords.add(m.toLowerCase()));
    }
  });
  
  return Array.from(keywords);
}

function expandKeywords(keywords: string[]): string[] {
  const expanded: Set<string> = new Set(keywords);
  
  keywords.forEach((kw) => {
    const synonyms = KEYWORD_SYNONYMS[kw.toLowerCase()];
    if (synonyms) {
      synonyms.forEach((syn) => expanded.add(syn));
    }
  });
  
  return Array.from(expanded);
}

async function browseSchoolChunks(
  schoolSlug: string,
  keyword?: string
): Promise<Array<{ id: string; path: string; text: string }>> {
  const supabase = getSupabaseAdmin();
  
  // Get school_id from slug
  const { data: schools } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', schoolSlug)
    .limit(1);

  if (!schools || schools.length === 0) {
    return [];
  }

  const schoolId = (schools[0] as any).id;

  // Get chunks
  let query = supabase
    .from('document_chunks')
    .select('id, chunk_text, heading_path')
    .eq('school_id', schoolId)
    .order('document_id', { ascending: true })
    .order('chunk_index', { ascending: true });

  // Apply keyword filter if provided
  if (keyword) {
    query = query.ilike('chunk_text', `%${keyword}%`);
  }

  const { data: chunks } = await query;

  if (!chunks || chunks.length === 0) {
    return [];
  }

  return chunks.map((c: any) => ({
    id: c.id,
    path: c.heading_path || '(root)',
    text: c.chunk_text,
  }));
}

async function preBrowseQuestion(item: GoldenItem): Promise<ChunkCandidate[]> {
  console.log(`\n📝 ${item.id}: ${item.question}`);
  
  // Extract school
  const schoolSlug = extractSchoolSlug(item.question);
  if (!schoolSlug) {
    console.log('   ⚠️  Could not extract school slug');
    return [];
  }
  console.log(`   🏫 School: ${schoolSlug}`);
  
  // Extract and expand keywords
  const baseKeywords = extractKeywords(item.question, item.note);
  const allKeywords = expandKeywords(baseKeywords);
  console.log(`   🔑 Keywords: ${allKeywords.slice(0, 5).join(', ')}${allKeywords.length > 5 ? '...' : ''}`);
  
  // Browse with each keyword
  const allChunks = new Map<string, { id: string; path: string; text: string; keywords: Set<string> }>();
  
  // First, try without keyword (get all chunks for this school, up to 200)
  const allSchoolChunks = await browseSchoolChunks(schoolSlug);
  console.log(`   📚 Total school chunks: ${allSchoolChunks.length}`);
  
  // Then filter by keywords in memory (more flexible than SQL ILIKE)
  for (const chunk of allSchoolChunks) {
    const lowerText = chunk.text.toLowerCase();
    const lowerPath = chunk.path.toLowerCase();
    
    const matchedKeywords = allKeywords.filter(
      (kw) => lowerText.includes(kw.toLowerCase()) || lowerPath.includes(kw.toLowerCase())
    );
    
    if (matchedKeywords.length > 0) {
      if (!allChunks.has(chunk.id)) {
        allChunks.set(chunk.id, {
          id: chunk.id,
          path: chunk.path,
          text: chunk.text,
          keywords: new Set(matchedKeywords),
        });
      } else {
        matchedKeywords.forEach((kw) => allChunks.get(chunk.id)!.keywords.add(kw));
      }
    }
  }
  
  console.log(`   ✅ Matched ${allChunks.size} candidate chunks`);
  
  // Convert to output format
  return Array.from(allChunks.values()).map((chunk) => ({
    chunk_id: chunk.id,
    path: chunk.path,
    text_preview: chunk.text.substring(0, 300),
    matched_keywords: Array.from(chunk.keywords),
  }));
}

async function saveCandidates(questionId: string, candidates: ChunkCandidate[]): Promise<void> {
  await fs.mkdir(CANDIDATES_DIR, { recursive: true });
  const filePath = path.join(CANDIDATES_DIR, `${questionId}.json`);
  await fs.writeFile(filePath, JSON.stringify(candidates, null, 2), 'utf-8');
}

async function main() {
  console.log('🚀 Pre-browsing candidate chunks for all questions\n');
  
  const items = await loadGolden();
  console.log(`Loaded ${items.length} questions\n`);
  
  let processed = 0;
  let failed = 0;
  
  for (const item of items) {
    try {
      const candidates = await preBrowseQuestion(item);
      await saveCandidates(item.id, candidates);
      processed++;
      
      // Rate limit
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`✅ Processed: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Candidates saved to: ${CANDIDATES_DIR}/`);
  console.log('\n📝 Next steps:');
  console.log('1. Review eval/candidates/*.json files');
  console.log('2. For each question, select chunk IDs as ground truth');
  console.log('3. Run: npm run eval:annotate (will use pre-browsed candidates)');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
