#!/usr/bin/env tsx
/**
 * Quick Test: Check if RPC works and embedding data is correct
 */

import { config } from 'dotenv';
import { getSupabaseAdmin } from '../../lib/knowledge/supabase-admin';
import { generateEmbeddings } from '../../lib/knowledge/embedder';

config({ path: '.env.local' });

async function quickTest() {
  console.log('🔍 Quick Test\n');

  const supabase = getSupabaseAdmin() as any;

  // 1. Check embedding data type
  console.log('1️⃣ Check embedding data type in database');
  const { data: sample, error: sampleError } = await supabase
    .from('document_chunks')
    .select('id, embedding')
    .limit(1)
    .single();

  if (sampleError) {
    console.error('❌ Error:', sampleError);
  } else {
    console.log(`✅ Sample chunk embedding type: ${typeof sample.embedding}`);
    if (Array.isArray(sample.embedding)) {
      console.log(`   Array length: ${sample.embedding.length}`);
    } else if (typeof sample.embedding === 'string') {
      console.log(`   String length: ${sample.embedding.length}`);
    }
  }

  // 2. Test RPC with simple embedding
  console.log('\n2️⃣ Test RPC function');
  const [embedding] = await generateEmbeddings(['test']);
  console.log(`Generated embedding: Array[${embedding.length}]`);

  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    'match_document_chunks',
    {
      query_embedding: embedding,
      match_threshold: 0.0,
      match_count: 5,
      filter_school_id: null,
    }
  );

  if (rpcError) {
    console.error('❌ RPC Error:', rpcError);
  } else {
    console.log(`✅ RPC returned ${rpcResult?.length || 0} chunks`);
    if (rpcResult && rpcResult.length > 0) {
      console.log(`   First chunk similarity: ${rpcResult[0].similarity}`);
    }
  }

  // 3. Check if chunks have embeddings
  console.log('\n3️⃣ Check chunks with embeddings');
  const { count: withEmbedding, error: countError } = await supabase
    .from('document_chunks')
    .select('id', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  if (countError) {
    console.error('❌ Error:', countError);
  } else {
    console.log(`✅ Chunks with embeddings: ${withEmbedding || 0}`);
  }

  // 4. Check total chunks
  console.log('\n4️⃣ Check total chunks');
  const { count: totalCount, error: totalError } = await supabase
    .from('document_chunks')
    .select('id', { count: 'exact', head: true });

  if (totalError) {
    console.error('❌ Error:', totalError);
  } else {
    console.log(`✅ Total chunks: ${totalCount || 0}`);
  }
}

quickTest().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
