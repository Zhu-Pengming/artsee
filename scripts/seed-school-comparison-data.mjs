#!/usr/bin/env node
/**
 * 为多维对比功能填充示例数据
 * 运行：node scripts/seed-school-comparison-data.mjs
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少环境变量：SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 示例数据：顶尖艺术院校
const sampleSchools = [
  {
    name: 'Royal College of Art',
    name_zh: '皇家艺术学院',
    name_en: 'Royal College of Art',
    city: 'London',
    country: 'United Kingdom',
    qs_art_design_rank: 1,
    program_count: 28,
    tuition_usd_per_year: 35000,
    portfolio_difficulty: 5,
    acceptance_rate: 8.5,
    city_cost_index: 5,
    career_resources_rating: 5,
    major_tags: ['纯艺术', '设计研究', '交互设计', '视觉传达', '产品设计'],
    school_type: '艺术学院',
    description: '世界顶尖艺术设计学院，专注研究生教育',
  },
  {
    name: 'University of the Arts London',
    name_zh: '伦敦艺术大学',
    qs_art_design_rank: 2,
    program_count: 45,
    tuition_usd_per_year: 29000,
    portfolio_difficulty: 4,
    acceptance_rate: 15.2,
    city_cost_index: 5,
    career_resources_rating: 5,
    major_tags: ['时尚设计', '视觉传达', '交互设计', '纯艺术', '建筑设计', '摄影'],
  },
  {
    name: 'Parsons School of Design',
    name_zh: '帕森斯设计学院',
    qs_art_design_rank: 3,
    program_count: 32,
    tuition_usd_per_year: 52000,
    portfolio_difficulty: 5,
    acceptance_rate: 12.0,
    city_cost_index: 5,
    career_resources_rating: 5,
    major_tags: ['时尚设计', '交互设计', '视觉传达', '产品设计', '品牌设计'],
  },
  {
    name: 'Rhode Island School of Design',
    name_zh: '罗德岛设计学院',
    qs_art_design_rank: 4,
    program_count: 19,
    tuition_usd_per_year: 56000,
    portfolio_difficulty: 5,
    acceptance_rate: 16.8,
    city_cost_index: 3,
    career_resources_rating: 4,
    major_tags: ['纯艺术', '工业设计', '插画', '建筑设计', '摄影'],
  },
  {
    name: 'Pratt Institute',
    name_zh: '普瑞特艺术学院',
    qs_art_design_rank: 10,
    program_count: 25,
    tuition_usd_per_year: 54000,
    portfolio_difficulty: 4,
    acceptance_rate: 50.0,
    city_cost_index: 5,
    career_resources_rating: 4,
    major_tags: ['工业设计', '室内设计', '建筑设计', '视觉传达', '数字艺术'],
  },
  {
    name: 'School of Visual Arts',
    name_zh: '纽约视觉艺术学院',
    qs_art_design_rank: 24,
    program_count: 22,
    tuition_usd_per_year: 48000,
    portfolio_difficulty: 3,
    acceptance_rate: 70.0,
    city_cost_index: 5,
    career_resources_rating: 4,
    major_tags: ['视觉传达', '插画', '动画', '摄影', '广告设计'],
  },
];

async function seedData() {
  console.log('🌱 开始填充多维对比示例数据...\n');

  for (const school of sampleSchools) {
    console.log(`📚 处理：${school.name_zh} (${school.name})`);

    // 检查学校是否已存在
    const { data: existing } = await supabase
      .from('schools')
      .select('id, name, name_zh')
      .or(`name.eq.${school.name},name_zh.eq.${school.name_zh}`)
      .limit(1)
      .single();

    if (existing) {
      // 更新现有学校
      const { error } = await supabase
        .from('schools')
        .update({
          program_count: school.program_count,
          tuition_usd_per_year: school.tuition_usd_per_year,
          portfolio_difficulty: school.portfolio_difficulty,
          acceptance_rate: school.acceptance_rate,
          city_cost_index: school.city_cost_index,
          career_resources_rating: school.career_resources_rating,
          major_tags: school.major_tags,
        })
        .eq('id', existing.id);

      if (error) {
        console.error(`  ❌ 更新失败：${error.message}`);
      } else {
        console.log(`  ✅ 已更新 (ID: ${existing.id})`);
      }
    } else {
      console.log(`  ⚠️  学校不存在，跳过（请先在数据库中创建基础院校数据）`);
    }

    console.log('');
  }

  console.log('✨ 数据填充完成！\n');
  console.log('📊 已更新字段：');
  console.log('  - program_count: 专业数量');
  console.log('  - tuition_usd_per_year: 年学费（美元）');
  console.log('  - portfolio_difficulty: 作品集难度（1-5）');
  console.log('  - acceptance_rate: 录取率（%）');
  console.log('  - city_cost_index: 城市生活费指数（1-5）');
  console.log('  - career_resources_rating: 就业资源评级（1-5）');
  console.log('  - major_tags: 专业标签');
}

seedData().catch((err) => {
  console.error('❌ 错误：', err);
  process.exit(1);
});
