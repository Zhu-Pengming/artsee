#!/usr/bin/env node
/**
 * 为Artsee应用创建测试数据
 * 用于验证所有Tab的动态数据加载功能
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少环境变量: SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  console.log('请在项目根目录的 .env 文件中配置这些变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log('🌱 开始创建测试数据...\n');

  // 1. 创建测试机会
  console.log('📋 创建合作机会...');
  const { data: opportunities, error: oppError } = await supabase
    .from('opportunities')
    .insert([
      {
        title: '迪奥艺术联名：中国纹样重构主题',
        type: 'collaboration',
        city: '上海',
        requirements: '需要有传统纹样设计经验，熟悉数字化工具',
        budget_min: 50000,
        budget_max: 150000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
      },
      {
        title: '上海新天地艺术节 - 2026驻留计划',
        type: 'residency',
        city: '上海',
        requirements: '景观装置或先锋影像方向',
        budget_max: 150000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
      },
      {
        title: '爱马仕：传统手工艺现代转化研究员',
        type: 'research',
        city: '北京',
        requirements: '竹编、可持续设计背景优先',
        budget_min: 30000,
        budget_max: 50000,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
      },
    ])
    .select();

  if (oppError && !oppError.message.includes('duplicate')) {
    console.error('  ❌ 机会创建失败:', oppError.message);
  } else {
    console.log(`  ✅ 创建了 ${opportunities?.length || 0} 个合作机会`);
  }

  // 2. 创建测试展览/活动
  console.log('\n🎨 创建展览活动...');
  const { data: events, error: eventError } = await supabase
    .from('events')
    .insert([
      {
        title: '西岸美术馆：本源之形',
        type: 'exhibition',
        city: '上海',
        venue: '西岸美术馆',
        summary: '蓬皮杜中心特展系列',
        start_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        fee_amount: 0,
        status: 'published',
      },
      {
        title: 'UCCA Edge：机器之魂',
        type: 'exhibition',
        city: '上海',
        venue: 'UCCA Edge',
        summary: 'AI与人类创造力的边界',
        start_time: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        fee_amount: 0,
        status: 'published',
      },
      {
        title: '丽思卡尔顿：宋韵青瓷私享鉴赏会',
        type: 'salon',
        city: '上海',
        venue: '丽思卡尔顿 · 绅士行政酒廊',
        summary: '从汝窑到官窑，特邀资深藏家现场分享',
        start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        fee_amount: 358,
        status: 'published',
      },
      {
        title: '柏悦酒店：当代艺术与私域藏家对谈',
        type: 'salon',
        city: '上海',
        venue: '柏悦酒店 · 悦厅',
        summary: '在云端之上，探讨当代艺术的资产配置与审美逻辑',
        start_time: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        fee_amount: 499,
        status: 'published',
      },
    ])
    .select();

  if (eventError && !eventError.message.includes('duplicate')) {
    console.error('  ❌ 活动创建失败:', eventError.message);
  } else {
    console.log(`  ✅ 创建了 ${events?.length || 0} 个展览活动`);
  }

  // 3. 创建测试问答帖子（需要通过APP创建，因为需要author_id）
  console.log('\n💬 跳过问答帖子（需要登录用户创建）...');

  // 4. 创建测试圈子
  console.log('\n🎯 创建社区圈子...');
  const { data: circles, error: circleError } = await supabase
    .from('community_circles')
    .insert([
      {
        title: '当代媒介艺术研究圈',
        subtitle: 'Medium Arts',
        category: 'art',
        city: '上海',
        member_count: 1200,
        status: 'published',
      },
      {
        title: '新中式建筑美学研习社',
        subtitle: 'Neo-Chinese Architecture',
        category: 'architecture',
        city: '北京',
        member_count: 850,
        status: 'published',
      },
      {
        title: '伦敦艺术留学互助联盟',
        subtitle: 'UAL/RCA Prep',
        category: 'study_abroad',
        city: '伦敦',
        member_count: 3400,
        status: 'published',
      },
    ])
    .select();

  if (circleError && !circleError.message.includes('duplicate')) {
    console.error('  ❌ 圈子创建失败:', circleError.message);
  } else {
    console.log(`  ✅ 创建了 ${circles?.length || 0} 个社区圈子`);
  }

  console.log('\n✨ 测试数据创建完成！');
  console.log('\n📱 现在可以在Flutter应用中查看这些数据：');
  console.log('   - 灵感Tab → 机会、展览、艺术家');
  console.log('   - 社区Tab → 问答、圈子、沙龙');
}

seedData().catch(console.error);
