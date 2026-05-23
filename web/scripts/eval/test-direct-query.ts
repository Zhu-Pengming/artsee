#!/usr/bin/env tsx
/**
 * Test Direct SQL Query
 * 
 * Bypass RPC and query directly to see if the issue is with the RPC function
 */

import { config } from 'dotenv';
import { getSupabaseAdmin } from '../../lib/knowledge/supabase-admin';
import { generateEmbeddings } from '../../lib/knowledge/embedder';

config({ path: '.env.local' });

async function testDirectQuery() {
  console.log('🔍 Testing Direct SQL Query\n');

  const supabase = getSupabaseAdmin() as any;

  // Test with Q004: "parsons服设学费多少刀"
  const question = 'parsons服设学费多少刀';
  console.log(`Question: ${question}\n`);

  const [embedding] = await generateEmbeddings([question]);
  console.log(`Generated embedding: Array[${embedding.length}]`);

  // Test 1: Direct query without distance calculation
  console.log('\nTest 1: Count all chunks in document_chunks');
  const { count: totalCount, error: countError } = await supabase
    .from('document_chunks')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error:', countError);
  } else {
    console.log(`✅ Total chunks in database: ${totalCount || 0}`);
  }

  // Test 2: Check if embedding column has data
  console.log('\nTest 2: Check embedding column');
  const { data: sampleChunks, error: sampleError } = await supabase
    .from('document_chunks')
    .select('id, embedding')
    .limit(3);

  if (sampleError) {
    console.error('❌ Error:', sampleError);
  } else {
    console.log(`✅ Retrieved ${sampleChunks?.length || 0} sample chunks`);
    sampleChunks?.forEach((chunk: any, i: number) => {
      const embType = typeof chunk.embedding;
      const embLength = Array.isArray(chunk.embedding)
        ? chunk.embedding.length
        : chunk.embedding?.length || 0;
      console.log(`   [${i + 1}] ID: ${chunk.id.substring(0, 8)}...`);
      console.log(`       Embedding type: ${embType}, length: ${embLength}`);
    });
  }

  // Test 3: Try to use the distance operator directly
  console.log('\nTest 3: Test pgvector distance operator');
  
  // Convert embedding array to pgvector format string
  const embeddingStr = `[${embedding.join(',')}]`;
  
  try {
    // Use raw SQL to test distance calculation
    const { data: distanceTest, error: distError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          id,
          chunk_text,
          embedding <=> $1::vector AS distance
        FROM document_chunks
        LIMIT 5
      `,
      params: [embeddingStr]
    });

    if (distError) {
      console.error('❌ Error with distance operator:', distError);
      console.log('   This might mean pgvector extension is not working');
    } else {
      console.log('✅ Distance operator works');
      console.log(`   Retrieved ${distanceTest?.length || 0} chunks`);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }

  // Test 4: Check if the RPC function exists
  console.log('\nTest 4: Check if match_document_chunks function exists');
  const { data: functions, error: funcError } = await supabase.rpc('sql', {
    query: `
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name = 'match_document_chunks'
    `
  }).catch(() => ({ data: null, error: 'SQL RPC not available' }));

  if (funcError || !functions) {
    console.log('⚠️  Cannot check function existence (SQL RPC not available)');
    console.log('   Trying alternative method...');
    
    // Try calling the function with dummy data to see if it exists
    const { error: testError } = await supabase.rpc('match_document_chunks', {
      query_embedding: new Array(1024).fill(0),
      match_threshold: 0.5,
      match_count: 1,
      filter_school_id: null,
    });
    
    if (testError) {
      if (testError.message?.includes('function') && testError.message?.includes('does not exist')) {
        console.log('❌ Function match_document_chunks does NOT exist!');
        console.log('   You need to run the schema update SQL script.');
      } else {
        console.log('✅ Function exists (got different error)');
        console.log(`   Error: ${testError.message}`);
      }
    } else {
      console.log('✅ Function exists and returned successfully');
    }
  } else {
    console.log('✅ Function match_document_chunks exists');
  }

  // Test 5: Check pgvector extension
  console.log('\nTest 5: Check pgvector extension');
  const { data: extensions, error: extError } = await supabase
    .from('pg_extension')
    .select('extname, extversion')
    .eq('extname', 'vector')
    .maybeSingle()
    .catch(() => ({ data: null, error: 'Cannot query pg_extension' }));

  if (extError || !extensions) {
    console.log('⚠️  Cannot check extension (might need superuser access)');
  } else if (!extensions) {
    console.log('❌ pgvector extension NOT installed!');
  } else {
    console.log(`✅ pgvector extension installed: v${extensions.extversion}`);
  }
}

testDirectQuery().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
