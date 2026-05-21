import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';

// 手动加载 .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fsSync.existsSync(envPath)) {
  const envContent = fsSync.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

import { getSupabaseAdmin } from '../lib/knowledge/supabase-admin';
import { parseMarkdownFile } from '../lib/knowledge/markdown-parser';
import { chunkMarkdown } from '../lib/knowledge/chunker';
import { generateEmbeddings } from '../lib/knowledge/embedder';
import { batchGenerateSparseVectors } from '../lib/knowledge/sparse-embedder';

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'embedding-2';

interface SchoolRecord {
  id: string;
  slug: string;
  name_en: string;
}

interface DocumentRecord {
  id: string;
  content_hash: string;
}

async function main() {
  const startTime = Date.now();

  const schoolSlug = parseArgs();
  console.log(`\n🚀 Starting wiki ingestion for school: ${schoolSlug}\n`);

  validateEnvironment();

  const school = await getSchool(schoolSlug);
  console.log(`✓ Found school: ${school.name_en} (ID: ${school.id})\n`);

  const wikiPath = getWikiPath(schoolSlug);
  await validateWikiPath(wikiPath);
  console.log(`✓ Wiki folder found: ${wikiPath}\n`);

  const markdownFiles = await getMarkdownFiles(wikiPath);
  console.log(`📚 Found ${markdownFiles.length} markdown files to process\n`);
  
  let totalDocs = 0;
  let totalChunks = 0;
  let totalTokens = 0;
  
  for (const filePath of markdownFiles) {
    const stats = await processDocument(filePath, school);
    if (stats) {
      totalDocs++;
      totalChunks += stats.chunks;
      totalTokens += stats.tokens;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n📊 Total Summary:`);
  console.log(`   Documents: ${totalDocs}`);
  console.log(`   Chunks: ${totalChunks}`);
  console.log(`   Tokens: ${totalTokens.toLocaleString()}`);
  console.log(`\n✅ Ingestion completed in ${duration}s\n`);
}

function parseArgs(): string {
  const args = process.argv.slice(2);
  const schoolIndex = args.indexOf('--school');

  if (schoolIndex === -1 || !args[schoolIndex + 1]) {
    console.error('❌ Error: Missing --school argument');
    console.log('Usage: npm run ingest -- --school <slug>');
    console.log('Example: npm run ingest -- --school antwerp-royal-academy');
    process.exit(1);
  }

  return args[schoolIndex + 1];
}

function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GLM_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.log('\nDebug - Loaded env vars:');
    Object.keys(process.env)
      .filter((k) => k.includes('SUPABASE') || k.includes('GLM'))
      .forEach((k) => console.log(`   ${k}=${process.env[k]?.substring(0, 20)}...`));
    console.log('\nPlease check your .env.local file');
    process.exit(1);
  }
}

async function getSchool(slug: string): Promise<SchoolRecord> {
  const { data, error } = await getSupabaseAdmin()
    .from('schools')
    .select('id, slug, name_en')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    console.error(`❌ School not found: ${slug}`);
    console.log(
      '\nPlease add this school to the schools table in Supabase first.'
    );
    process.exit(1);
  }

  return data as unknown as SchoolRecord;
}

function getWikiPath(slug: string): string {
  return path.resolve(
    process.cwd(),
    'knowledge-base',
    'schools',
    slug
  );
}

async function validateWikiPath(wikiPath: string) {
  try {
    const stat = await fs.stat(wikiPath);
    if (!stat.isDirectory()) {
      throw new Error('Not a directory');
    }
  } catch {
    console.error(`❌ Wiki folder not found: ${wikiPath}`);
    console.log('\nPlease ensure:');
    console.log('1. The knowledge-base symlink is created');
    console.log('2. The wiki folder structure exists');
    console.log('3. The school slug matches the folder name');
    process.exit(1);
  }
}

async function getMarkdownFiles(wikiPath: string): Promise<string[]> {
  const EXCLUDED_FILES = ['log.md', 'sources.md', 'open-questions.md'];
  const files: string[] = [];
  
  async function scanDirectory(dirPath: string) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        if (!EXCLUDED_FILES.includes(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await scanDirectory(wikiPath);
  return files.sort();
}

async function processDocument(
  filePath: string,
  school: SchoolRecord
): Promise<{ chunks: number; tokens: number } | null> {
  console.log(`📄 Processing: ${path.basename(filePath)}`);

  try {
    await fs.access(filePath);
  } catch {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const parsed = await parseMarkdownFile(filePath);
  console.log(`   Hash: ${parsed.contentHash.substring(0, 12)}...`);

  const existingDoc = await checkExistingDocument(
    school.id,
    path.relative(getWikiPath(school.slug), filePath)
  );

  if (existingDoc && existingDoc.content_hash === parsed.contentHash) {
    console.log('   ⏭️  Skipped (no changes detected)\n');
    return null;
  }

  console.log('   📦 Chunking markdown...');
  const chunks = await chunkMarkdown(parsed.content, school.name_en);
  console.log(`   ✓ Generated ${chunks.length} chunks`);

  const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);
  console.log(`   ✓ Total tokens: ${totalTokens.toLocaleString()}`);

  console.log('   🔮 Generating embeddings...');
  let embeddings;
  let sparseVectors;
  try {
    // Generate dense embeddings
    embeddings = await generateEmbeddings(chunks.map((c) => c.text));
    console.log(`   ✓ Generated ${embeddings.length} dense embeddings`);
    
    // Generate sparse vectors (Phase 2.5)
    sparseVectors = await batchGenerateSparseVectors(chunks.map((c) => c.text));
    console.log(`   ✓ Generated ${sparseVectors.length} sparse vectors`);
  } catch (error: any) {
    console.warn(`   ⚠️  Embedding generation failed: ${error.message}`);
    console.warn('   ⏭️  Skipping this document due to embedding error');
    return null;
  }

  console.log('   💾 Writing to database...');
  await writeToDatabase(
    school,
    parsed,
    chunks,
    embeddings,
    sparseVectors,
    path.relative(getWikiPath(school.slug), filePath),
    existingDoc?.id
  );
  console.log('   ✓ Database updated\n');

  return { chunks: chunks.length, tokens: totalTokens };
}

async function checkExistingDocument(
  schoolId: string,
  sourcePath: string
): Promise<DocumentRecord | null> {
  const { data } = await getSupabaseAdmin()
    .from('school_documents')
    .select('id, content_hash')
    .eq('school_id', schoolId)
    .eq('source_path', sourcePath)
    .single();

  return data as DocumentRecord | null;
}

function getDocType(filename: string): string {
  const basename = path.basename(filename, '.md');
  
  const typeMap: Record<string, string> = {
    'index': 'overview',
    'baidu': 'research',
    'gpt-research': 'research',
    'deepseek': 'research',
    'wiki': 'reference',
    'bilibili': 'research',
    'xiaohongshu-post': 'research',
  };
  
  return typeMap[basename] || 'other';
}

async function writeToDatabase(
  school: SchoolRecord,
  parsed: Awaited<ReturnType<typeof parseMarkdownFile>>,
  chunks: Awaited<ReturnType<typeof chunkMarkdown>>,
  embeddings: number[][],
  sparseVectors: any[], // SparseVector[] from sparse-embedder
  sourcePath: string,
  existingDocId?: string
) {
  const docType = getDocType(sourcePath);

  const documentData = {
    school_id: school.id,
    source_path: sourcePath,
    doc_type: docType,
    content_md: parsed.content,
    content_hash: parsed.contentHash,
    metadata: parsed.frontmatter,
  };

  let documentId: string;

  if (existingDocId) {
    const { error } = await (getSupabaseAdmin() as any)
      .from('school_documents')
      .update(documentData)
      .eq('id', existingDocId);

    if (error) throw error;
    documentId = existingDocId;

    await (getSupabaseAdmin() as any)
      .from('document_chunks')
      .delete()
      .eq('document_id', documentId);
  } else {
    const { data, error } = await (getSupabaseAdmin() as any)
      .from('school_documents')
      .insert(documentData)
      .select('id')
      .single();

    if (error) throw error;
    documentId = data.id;
  }

  const CHUNK_BATCH_SIZE = 50;
  for (let i = 0; i < chunks.length; i += CHUNK_BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + CHUNK_BATCH_SIZE);
    const batchEmbeddings = embeddings.slice(i, i + CHUNK_BATCH_SIZE);
    const batchSparseVectors = sparseVectors.slice(i, i + CHUNK_BATCH_SIZE);

    const chunkRecords = batchChunks.map((chunk, idx) => {
      const embedding = batchEmbeddings[idx];
      const sparseVector = batchSparseVectors[idx];
      
      // Convert embedding array to pgvector format: [val1, val2, ...]
      const embeddingStr = `[${embedding.join(',')}]`;
      
      return {
        school_id: school.id,
        document_id: documentId,
        chunk_index: chunk.chunkIndex,
        chunk_text: chunk.text,
        heading_path: chunk.headingPath,
        token_count: chunk.tokenCount,
        embedding: embeddingStr,
        embedding_model: EMBEDDING_MODEL,
        sparse_vector: sparseVector, // Phase 2.5: Store sparse vector as JSONB
      };
    });

    const { error } = await (getSupabaseAdmin() as any)
      .from('document_chunks')
      .insert(chunkRecords);

    if (error) throw error;
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
