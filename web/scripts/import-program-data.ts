#!/usr/bin/env tsx
/**
 * Import Program Structured Data
 * 
 * 导入学校项目的结构化数据（学费、截止日期等）到 programs 表
 * 
 * Usage:
 *   npm run import:programs
 */

import { config } from 'dotenv';
import { getSupabaseAdmin } from '../lib/knowledge/supabase-admin';

config({ path: '.env.local' });

// 示例数据：RCA 的几个项目
// 注意：使用实际数据库的字段名（raw_degree_type, school_id 是 UUID）
const SAMPLE_PROGRAMS = [
  {
    school_slug: 'royal-college-art',
    program_name: 'Painting MA',
    raw_degree_type: 'MA',
    degree_full_name: 'Master of Arts',
    program_category: 'Fine Art',
    duration_text: '2 years',
    duration_months: 24,
    requires_portfolio: true,
    status: 'active',
    is_recommended: true,
  },
  {
    school_slug: 'royal-college-art',
    program_name: 'Sculpture MA',
    raw_degree_type: 'MA',
    degree_full_name: 'Master of Arts',
    program_category: 'Fine Art',
    duration_text: '2 years',
    duration_months: 24,
    requires_portfolio: true,
    status: 'active',
    is_recommended: true,
  },
  {
    school_slug: 'parsons-school-design',
    program_name: 'Fashion Design MFA',
    raw_degree_type: 'MFA',
    degree_full_name: 'Master of Fine Arts',
    program_category: 'Fashion',
    duration_text: '2 years',
    duration_months: 24,
    requires_portfolio: true,
    status: 'active',
    is_recommended: true,
  },
  {
    school_slug: 'central-saint-martins',
    program_name: 'Fine Art MA',
    raw_degree_type: 'MA',
    degree_full_name: 'Master of Arts',
    program_category: 'Fine Art',
    duration_text: '2 years',
    duration_months: 24,
    requires_portfolio: true,
    status: 'active',
    is_recommended: true,
  },
];

async function getSchoolId(slug: string): Promise<string | null> {
  const supabase = getSupabaseAdmin() as any;
  const { data, error } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', slug)
    .single();
  
  if (error || !data) {
    console.error(`❌ School not found: ${slug}`);
    return null;
  }
  
  return data.id; // UUID string
}

async function importPrograms() {
  console.log('🚀 Importing program structured data...\n');
  
  const supabase = getSupabaseAdmin() as any;
  
  let successCount = 0;
  let failCount = 0;
  
  for (const programData of SAMPLE_PROGRAMS) {
    const { school_slug, ...programFields } = programData;
    
    console.log(`📝 Processing: ${programData.program_name} (${school_slug})`);
    
    // Get school ID
    const schoolId = await getSchoolId(school_slug);
    if (!schoolId) {
      failCount++;
      continue;
    }
    
    try {
      // Insert program
      const { data: program, error: programError } = await supabase
        .from('programs')
        .insert({
          school_id: schoolId,
          ...programFields,
        })
        .select()
        .single();
      
      if (programError) {
        console.error(`   ❌ Failed to insert program: ${programError.message}`);
        failCount++;
        continue;
      }
      
      console.log(`   ✅ Program created (ID: ${program.id})`);
      successCount++;
      console.log('');
      
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('================================================================================');
  console.log(`✅ Import complete`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total: ${SAMPLE_PROGRAMS.length}`);
}

async function main() {
  try {
    await importPrograms();
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
