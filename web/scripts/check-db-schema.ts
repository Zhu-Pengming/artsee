#!/usr/bin/env tsx
/**
 * Check Database Schema
 * 
 * 检查数据库中 programs 表的实际结构
 */

import { config } from 'dotenv';
import { getSupabaseAdmin } from '../lib/knowledge/supabase-admin';

config({ path: '.env.local' });

async function checkSchema() {
  const supabase = getSupabaseAdmin() as any;
  
  console.log('🔍 Checking programs table schema...\n');
  
  // Try to query the table
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error querying programs table:', error.message);
    console.log('\n💡 The programs table may not exist yet.');
    console.log('   Run the SQL from /api/v1/init-db to create it.');
    return;
  }
  
  console.log('✅ programs table exists');
  console.log(`   Rows: ${data?.length || 0}`);
  
  if (data && data.length > 0) {
    console.log('\n📋 Sample row:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('\n⚠️  Table is empty');
  }
  
  // Check schools table
  console.log('\n🔍 Checking schools table...');
  const { data: schools, error: schoolsError } = await supabase
    .from('schools')
    .select('id, slug, name_zh, name_en')
    .in('slug', ['royal-college-art', 'parsons-school-design', 'central-saint-martins'])
    .limit(5);
  
  if (schoolsError) {
    console.error('❌ Error:', schoolsError.message);
  } else {
    console.log(`✅ Found ${schools?.length || 0} schools`);
    schools?.forEach((s: any) => {
      console.log(`   - ${s.slug} (ID: ${s.id})`);
    });
  }
  
  // Check program_fees table
  console.log('\n🔍 Checking program_fees table...');
  const { data: fees, error: feesError } = await supabase
    .from('program_fees')
    .select('*')
    .limit(1);
  
  if (feesError) {
    console.error('❌ program_fees table does not exist or error:', feesError.message);
  } else {
    console.log(`✅ program_fees table exists (${fees?.length || 0} rows)`);
    if (fees && fees.length > 0) {
      console.log('   Sample:', JSON.stringify(fees[0], null, 2));
    }
  }
  
  // Check program_admissions table
  console.log('\n🔍 Checking program_admissions table...');
  const { data: admissions, error: admissionsError } = await supabase
    .from('program_admissions')
    .select('*')
    .limit(1);
  
  if (admissionsError) {
    console.error('❌ program_admissions table does not exist or error:', admissionsError.message);
  } else {
    console.log(`✅ program_admissions table exists (${admissions?.length || 0} rows)`);
    if (admissions && admissions.length > 0) {
      console.log('   Sample:', JSON.stringify(admissions[0], null, 2));
    }
  }
}

checkSchema();
