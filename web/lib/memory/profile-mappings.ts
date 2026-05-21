/**
 * 用户画像字段的枚举值到自然语言的映射表
 * 前端展示和 LLM prompt 都复用这套映射
 */

export const USER_ROLE_MAP: Record<string, string> = {
  student: '申请的学生',
  parent: '家长',
  working_professional: '已工作的转行者',
  artist: '艺术家/创作者',
};

export const TARGET_DEGREE_MAP: Record<string, string> = {
  foundation: 'Foundation/预科',
  bachelor: '本科(BA/BFA)',
  master: '研究生(MA/MFA)',
  phd: '博士',
  non_degree: '非学位项目',
};

export const CURRENT_EDUCATION_STAGE_MAP: Record<string, string> = {
  high_school: '高中在读',
  university_undergrad: '大学本科在读',
  graduated: '已毕业',
  working: '在职',
};

export const TARGET_DIRECTION_MAP: Record<string, string> = {
  fine_arts: '纯艺术',
  design: '设计',
  media_arts: '媒体艺术',
  architecture: '建筑',
  performance: '表演',
  music: '音乐',
  film: '电影/摄影',
};

export const TARGET_MAJOR_MAP: Record<string, string> = {
  fashion_design: '时装设计',
  textile_design: '纺织品设计',
  graphic_design: '平面设计',
  illustration: '插画',
  product_design: '产品设计',
  interior_design: '室内设计',
  interaction_design: '交互设计',
  jewelry_design: '首饰设计',
  painting: '绘画',
  sculpture: '雕塑',
  photography: '摄影',
  animation: '动画',
  film_production: '电影制作',
  architecture: '建筑',
};

export const SCHOOL_TYPE_PREFERENCE_MAP: Record<string, string> = {
  comprehensive_university: '综合大学',
  art_academy: '独立艺术学院',
  design_school: '设计学院',
  conservatory: '音乐学院',
};

export const RANKING_SENSITIVITY_MAP: Record<string, string> = {
  very_important: '非常看重排名',
  moderately: '适度关注排名',
  not_important: '不太在意排名',
};

export const CITY_PREFERENCE_MAP: Record<string, string> = {
  big_city: '偏好大城市',
  small_town: '偏好小城镇',
  doesnt_matter: '对城市规模无偏好',
};

export const PORTFOLIO_STATUS_MAP: Record<string, string> = {
  not_started: '还没开始',
  brainstorming: '构思阶段',
  in_progress: '正在进行中',
  mostly_done: '接近完成',
  refining: '精修阶段',
};

export const PORTFOLIO_STYLE_MAP: Record<string, string> = {
  conceptual: '概念性',
  commercial: '商业性',
  craft_based: '工艺性',
  experimental: '实验性',
  narrative: '叙事性',
};

export const ENGLISH_TEST_TYPE_MAP: Record<string, string> = {
  toefl: '托福',
  ielts: '雅思',
  duolingo: 'Duolingo',
  not_taken: '还没考',
  not_planned: '不打算考',
};

export const BUDGET_RANGE_MAP: Record<string, string> = {
  under_30: '30 万人民币/年以下',
  '30_50': '30-50 万人民币/年',
  '50_80': '50-80 万人民币/年',
  '80_plus': '80 万人民币/年以上',
};

export const SCHOLARSHIP_NEED_MAP: Record<string, string> = {
  must_have: '必须获得奖学金',
  preferred: '希望有奖学金',
  not_needed: '不需要奖学金',
};

export const FAMILY_SUPPORT_MAP: Record<string, string> = {
  fully: '家庭全额支持',
  partially: '家庭部分支持',
  self_funded: '自费',
};

export const PRIORITY_FACTOR_MAP: Record<string, string> = {
  reputation: '学校声誉',
  teaching: '教学质量',
  career: '职业出路',
  culture: '校园文化',
  cost: '费用',
  location: '地理位置',
  faculty: '师资力量',
  alumni: '校友网络',
};

export const TARGET_INTAKE_MAP: Record<string, string> = {
  '2025_fall': '2025 年秋季',
  '2026_spring': '2026 年春季',
  '2026_fall': '2026 年秋季',
  '2027_fall': '2027 年秋季',
  flexible: '时间灵活',
};

/**
 * 计算距离目标入学的月数
 */
export function calculateMonthsToIntake(targetIntake: string): number | null {
  const now = new Date();
  const intakeMap: Record<string, Date> = {
    '2025_fall': new Date('2025-09-01'),
    '2026_spring': new Date('2026-01-15'),
    '2026_fall': new Date('2026-09-01'),
    '2027_fall': new Date('2027-09-01'),
  };
  
  const intakeDate = intakeMap[targetIntake];
  if (!intakeDate) return null;
  
  const months = Math.round((intakeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
  return months > 0 ? months : null;
}

/**
 * 获取申请截止时间描述
 */
export function getDeadlineDescription(targetIntake: string): string {
  const months = calculateMonthsToIntake(targetIntake);
  if (!months) return '';
  
  // 一般申请截止在入学前 8-10 个月
  const deadlineMonths = Math.max(0, months - 8);
  
  if (deadlineMonths <= 0) {
    return '已接近或超过主要申请截止时间';
  } else if (deadlineMonths <= 3) {
    return `距离主要申请截止还有约 ${deadlineMonths} 个月`;
  } else {
    return `距离主要申请截止还有约 ${deadlineMonths} 个月`;
  }
}
