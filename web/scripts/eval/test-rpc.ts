#!/usr/bin/env tsx
/**
 * Test RPC Function
 * 
 * Directly test the match_document_chunks RPC to see why it returns 0 results
 */

import { config } from 'dotenv';
import { getSupabaseAdmin } from '../../lib/knowledge/supabase-admin';
import { generateEmbeddings } from '../../lib/knowledge/embedder';

config({ path: '.env.local' });

async function testRPC() {
  console.log('🔍 Testing match_document_chunks RPC\n');

  const supabase = getSupabaseAdmin() as any;

  // Test with Q004: "parsons服设学费多少刀"
  const question = 'parsons服设学费多少刀';
  console.log(`Question: ${question}\n`);

  const [embedding] = await generateEmbeddings([question]);
  console.log(`Generated embedding: Array[${embedding.length}]`);
  console.log(`First 3 values: [${embedding.slice(0, 3).join(', ')}...]\n`);

  // Test 1: No filters, no threshold
  console.log('Test 1: No filters, match_threshold = 0.0');
  const { data: test1, error: error1 } = await supabase.rpc('match_document_chunks', {
    query_embedding: embedding,
    match_threshold: 0.0,
    match_count: 10,
    filter_school_id: null,
  });

  if (error1) {
    console.error('❌ Error:', error1);
  } else {
    console.log(`✅ Retrieved ${test1?.length || 0} chunks`);
    if (test1 && test1.length > 0) {
      console.log('Top 3:');
      test1.slice(0, 3).forEach((c: any, i: number) => {
        console.log(`  [${i + 1}] Similarity: ${c.similarity.toFixed(4)}`);
        console.log(`      School: ${c.school_id}`);
        console.log(`      Path: ${c.heading_path.split(' > ').slice(0, 2).join(' > ')}`);
      });
    }
  }

  // Test 1b: Try with negative threshold to bypass all filtering
  console.log('\nTest 1b: match_threshold = -1.0 (should return everything)');
  const { data: test1b, error: error1b } = await supabase.rpc('match_document_chunks', {
    query_embedding: embedding,
    match_threshold: -1.0,
    match_count: 10,
    filter_school_id: null,
  });

  if (error1b) {
    console.error('❌ Error:', error1b);
  } else {
    console.log(`✅ Retrieved ${test1b?.length || 0} chunks`);
    if (test1b && test1b.length > 0) {
      console.log('Top 3:');
      test1b.slice(0, 3).forEach((c: any, i: number) => {
        console.log(`  [${i + 1}] Similarity: ${c.similarity.toFixed(4)}`);
        console.log(`      School: ${c.school_id}`);
        console.log(`      Path: ${c.heading_path.split(' > ').slice(0, 2).join(' > ')}`);
      });
      
      // Check if ground truth is in results
      const gtInResults = test1b.find((c: any) => c.chunk_id === gtChunkId);
      if (gtInResults) {
        console.log(`\n✅ Ground truth chunk found at rank ${test1b.findIndex((c: any) => c.chunk_id === gtChunkId) + 1}`);
        console.log(`   Similarity: ${gtInResults.similarity.toFixed(4)}`);
      } else {
        console.log('\n❌ Ground truth chunk NOT in results');
      }
    }
  }

  // Test 2: Check if ground truth chunk exists
  console.log('\nTest 2: Check if ground truth chunk exists');
  const gtChunkId = '7dcc5077-21e1-48de-8f8a-928ab8ff926f';
  const { data: gtChunk, error: gtError } = await supabase
    .from('document_chunks')
    .select('id, chunk_text, heading_path, embedding')
    .eq('id', gtChunkId)
    .single();

  if (gtError) {
    console.error('❌ Error:', gtError);
  } else if (!gtChunk) {
    console.log('❌ Ground truth chunk not found!');
  } else {
    console.log('✅ Ground truth chunk exists');
    console.log(`   Path: ${gtChunk.heading_path}`);
    
    // Parse embedding
    let gtEmbedding = gtChunk.embedding;
    if (typeof gtEmbedding === 'string') {
      const cleaned = gtEmbedding.replace(/^\[|\]$/g, '');
      gtEmbedding = cleaned.split(',').map((v: string) => parseFloat(v.trim()));
    }
    
    // Calculate similarity manually
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < embedding.length; i++) {
      dotProduct += embedding[i] * gtEmbedding[i];
      normA += embedding[i] * embedding[i];
      normB += gtEmbedding[i] * gtEmbedding[i];
    }
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    console.log(`   Manual similarity: ${similarity.toFixed(4)}`);
  }

  // Test 3: Get school_id for Parsons
  console.log('\nTest 3: Find Parsons school_id');
  const { data: schools, error: schoolError } = await supabase
    .from('schools')
    .select('id, slug, name_en')
    .ilike('slug', '%parsons%');

  if (schoolError) {
    console.error('❌ Error:', schoolError);
  } else if (!schools || schools.length === 0) {
    console.log('❌ No Parsons school found!');
  } else {
    console.log(`✅ Found ${schools.length} school(s):`);
    schools.forEach((s: any) => {
      console.log(`   - ${s.slug} (${s.name_en})`);
      console.log(`     ID: ${s.id}`);
    });

    // Test 4: Check if ground truth chunk's document exists
    if (gtChunk) {
      console.log('\nTest 4: Check ground truth chunk document');
      
      // First, check the document_id
      const { data: chunkInfo, error: chunkError } = await supabase
        .from('document_chunks')
        .select('document_id')
        .eq('id', gtChunkId)
        .single();
      
      if (chunkError) {
        console.error('❌ Error getting chunk info:', chunkError);
      } else {
        console.log(`   Chunk document_id: ${chunkInfo.document_id}`);
        
        // Check if this document exists in school_documents
        const { data: doc, error: docError } = await supabase
          .from('school_documents')
          .select('id, school_id, schools(slug, name_en)')
          .eq('id', chunkInfo.document_id)
          .maybeSingle();

        if (docError) {
          console.error('❌ Error getting document:', docError);
        } else if (!doc) {
          console.log('❌ Document NOT found in school_documents table!');
          console.log('   This is why RPC returns 0 results - the JOIN fails.');
        } else {
          console.log(`✅ Document found in school_documents`);
          console.log(`   School: ${doc.schools?.slug || 'N/A'}`);
        }
      }
    }
  }

  // Test 5: Count total chunks for Parsons
  console.log('\nTest 5: Count Parsons chunks in database');
  if (schools && schools.length > 0) {
    const parsonsId = schools[0].id;
    
    // First get document IDs
    const { data: docs, error: docsError } = await supabase
      .from('school_documents')
      .select('id')
      .eq('school_id', parsonsId);

    if (docsError) {
      console.error('❌ Error getting documents:', docsError);
    } else if (!docs || docs.length === 0) {
      console.log('❌ No documents found for Parsons!');
    } else {
      console.log(`✅ Found ${docs.length} document(s) for Parsons`);
      
      const docIds = docs.map((d: any) => d.id);
      const { count, error: countError } = await supabase
        .from('document_chunks')
        .select('id', { count: 'exact', head: true })
        .in('document_id', docIds);

      if (countError) {
        console.error('❌ Error counting chunks:', countError);
      } else {
        console.log(`   Total Parsons chunks: ${count || 0}`);
      }
    }
  }
  
  // Test 6: Check orphaned chunks
  console.log('\nTest 6: Check for orphaned chunks (chunks without valid document_id)');
  const { count: orphanedCount, error: orphanError } = await supabase
    .from('document_chunks')
    .select('id', { count: 'exact', head: true })
    .not('document_id', 'in', `(SELECT id FROM school_documents)`);
  
  if (orphanError) {
    console.error('❌ Error:', orphanError);
  } else {
    console.log(`   Orphaned chunks: ${orphanedCount || 0}`);
    if (orphanedCount && orphanedCount > 0) {
      console.log('   ⚠️  These chunks exist but have no valid school_documents entry!');
    }
  }
}

testRPC().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
