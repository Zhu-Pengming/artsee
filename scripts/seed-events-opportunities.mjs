#!/usr/bin/env node
/**
 * 为 events 和 opportunities 表上传测试数据
 * 运行：npm run seed:events
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 测试活动数据
const mockEvents = [
  {
    title: '伦敦艺术沙龙 · 作品集评审专场',
    summary: '邀请 RCA、UAL 在职导师现场点评作品集，提供申请建议',
    description: '本次沙龙邀请皇家艺术学院（RCA）和伦敦艺术大学（UAL）的在职导师，为学生提供一对一作品集评审服务。活动包括：\n\n1. 作品集诊断（30分钟/人）\n2. 申请策略规划\n3. 院校选择建议\n4. 茶歇交流',
    city: '伦敦',
    venue: 'Shoreditch Design Studio',
    hotel_name: null,
    type: 'salon',
    cover_url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800',
    start_time: new Date('2026-06-15T14:00:00Z').toISOString(),
    end_time: new Date('2026-06-15T18:00:00Z').toISOString(),
    quota: 20,
    fee_amount: 0,
    currency: 'gbp',
    status: 'published',
    metadata: { tags: ['作品集', '导师评审', 'RCA', 'UAL'] }
  },
  {
    title: '纽约艺术周末 · RISD 校友分享会',
    summary: 'RISD 工业设计校友分享求学经历与职业发展路径',
    description: '罗德岛设计学院（RISD）工业设计专业毕业生，现就职于 Apple 设计团队的校友，将分享：\n\n- RISD 学习体验\n- 作品集准备心得\n- 从学生到设计师的转变\n- 硅谷设计行业现状\n\n适合对工业设计、交互设计感兴趣的同学参加。',
    city: '纽约',
    venue: 'Brooklyn Art Space',
    hotel_name: null,
    type: 'salon',
    cover_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    start_time: new Date('2026-06-22T19:00:00Z').toISOString(),
    end_time: new Date('2026-06-22T21:00:00Z').toISOString(),
    quota: 30,
    fee_amount: 2500,
    currency: 'cny',
    status: 'published',
    metadata: { tags: ['RISD', '校友分享', '工业设计', '职业发展'] }
  },
  {
    title: '米兰设计周 · 艺术留学展览',
    summary: '展示中国学生的优秀作品集项目，与意大利设计师交流',
    description: '在米兰设计周期间举办的中国艺术留学生作品展，展出内容包括：\n\n- 服装设计\n- 产品设计\n- 视觉传达\n- 空间设计\n\n现场将有意大利设计师与参展学生交流，提供作品反馈。',
    city: '米兰',
    venue: 'Triennale di Milano',
    hotel_name: 'Hotel Milano Scala',
    type: 'exhibition',
    cover_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    start_time: new Date('2026-04-18T10:00:00Z').toISOString(),
    end_time: new Date('2026-04-23T20:00:00Z').toISOString(),
    quota: 100,
    fee_amount: 15000,
    currency: 'cny',
    status: 'published',
    metadata: { tags: ['米兰设计周', '作品展', '设计师交流'] }
  },
  {
    title: '上海 · 艺术留学规划工作坊',
    summary: '从零开始规划艺术留学申请，适合高中生和大一学生',
    description: '为准备艺术留学的学生提供系统化规划指导：\n\n- 如何选择目标国家和院校\n- 作品集准备时间线\n- 语言考试规划\n- 预算与奖学金申请\n\n由资深留学顾问主讲，小班授课。',
    city: '上海',
    venue: 'Artiqore 上海办公室',
    hotel_name: null,
    type: 'workshop',
    cover_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
    start_time: new Date('2026-07-05T13:00:00Z').toISOString(),
    end_time: new Date('2026-07-05T17:00:00Z').toISOString(),
    quota: 15,
    fee_amount: 0,
    currency: 'cny',
    status: 'published',
    metadata: { tags: ['留学规划', '工作坊', '申请指导'] }
  }
];

// 测试合作机会数据
const mockOpportunities = [
  {
    title: '上海时装周 · 视觉设计师招募',
    type: 'collaboration',
    city: '上海',
    budget_min: 8000,
    budget_max: 15000,
    deadline: new Date('2026-06-30T23:59:59Z').toISOString(),
    requirements: '为上海时装周品牌设计视觉物料，包括：\n\n- 主视觉海报\n- 邀请函设计\n- 现场导视系统\n- 社交媒体素材\n\n**要求：**\n- 有时尚或服装设计相关经验\n- 熟练使用 Adobe Creative Suite\n- 提供至少 3 个相关案例',
    submission_materials: [
      { type: 'portfolio', required: true, description: '作品集（PDF 或在线链接）' },
      { type: 'proposal', required: true, description: '设计提案（500 字以内）' },
      { type: 'resume', required: false, description: '个人简历' }
    ],
    status: 'published',
    metadata: { tags: ['视觉设计', '时装周', '品牌设计'], industry: '时尚' }
  },
  {
    title: '北京画廊 · 策展助理实习',
    type: 'internship',
    city: '北京',
    budget_min: 0,
    budget_max: 0,
    deadline: new Date('2026-07-15T23:59:59Z').toISOString(),
    requirements: '协助画廊日常运营与展览策划：\n\n- 展览布展与撤展\n- 艺术家沟通协调\n- 开幕活动组织\n- 社交媒体运营\n\n**要求：**\n- 艺术史、策展或相关专业在读/毕业\n- 对当代艺术有热情\n- 良好的中英文沟通能力\n- 每周至少 3 天',
    submission_materials: [
      { type: 'resume', required: true, description: '个人简历' },
      { type: 'cover_letter', required: true, description: '求职信（说明为何对策展感兴趣）' }
    ],
    status: 'published',
    metadata: { tags: ['策展', '实习', '画廊'], industry: '艺术' }
  },
  {
    title: '深圳科技公司 · UI/UX 设计师',
    type: 'job',
    city: '深圳',
    budget_min: 15000,
    budget_max: 25000,
    deadline: new Date('2026-08-01T23:59:59Z').toISOString(),
    requirements: '为 AI 教育产品设计用户界面：\n\n- 移动端 App 界面设计\n- 交互原型制作\n- 用户体验优化\n- 设计系统维护\n\n**要求：**\n- 1-3 年 UI/UX 设计经验\n- 熟练使用 Figma\n- 有教育或 AI 产品经验优先\n- 提供作品集',
    submission_materials: [
      { type: 'portfolio', required: true, description: '作品集（必须包含移动端案例）' },
      { type: 'resume', required: true, description: '个人简历' }
    ],
    status: 'published',
    metadata: { tags: ['UI/UX', 'AI', '教育科技'], industry: '科技' }
  },
  {
    title: '成都独立咖啡馆 · 空间艺术装置',
    type: 'collaboration',
    city: '成都',
    budget_min: 5000,
    budget_max: 10000,
    deadline: new Date('2026-06-20T23:59:59Z').toISOString(),
    requirements: '为新开业咖啡馆设计并制作艺术装置：\n\n- 主题：「城市记忆」\n- 尺寸：3m x 2m 墙面装置\n- 材料：不限（需考虑安全性）\n- 工期：1 个月\n\n**要求：**\n- 有空间装置或雕塑经验\n- 能独立完成制作与安装\n- 提供设计草图与预算明细',
    submission_materials: [
      { type: 'portfolio', required: true, description: '过往装置作品' },
      { type: 'proposal', required: true, description: '设计方案与预算' }
    ],
    status: 'published',
    metadata: { tags: ['装置艺术', '空间设计', '咖啡馆'], industry: '艺术' }
  }
];

async function seedData() {
  console.log('🌱 开始上传测试数据...\n');

  // 1. 上传活动
  console.log('📅 上传活动数据...');
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .insert(mockEvents)
    .select();

  if (eventsError) {
    console.error('❌ 活动上传失败:', eventsError.message);
  } else {
    console.log(`✅ 成功上传 ${events.length} 条活动数据`);
  }

  // 2. 上传合作机会
  console.log('\n🤝 上传合作机会数据...');
  const { data: opportunities, error: oppsError } = await supabase
    .from('opportunities')
    .insert(mockOpportunities)
    .select();

  if (oppsError) {
    console.error('❌ 合作机会上传失败:', oppsError.message);
  } else {
    console.log(`✅ 成功上传 ${opportunities.length} 条合作机会数据`);
  }

  console.log('\n🎉 数据上传完成！');
}

seedData().catch(console.error);
