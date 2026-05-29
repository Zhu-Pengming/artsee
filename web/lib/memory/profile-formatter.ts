/**
 * 用户画像格式化器 - 将结构化画像转换为 LLM 友好的自然语言
 * 分三层：身份画像、硬约束、软偏好
 */

import {
  USER_ROLE_MAP,
  TARGET_DEGREE_MAP,
  CURRENT_EDUCATION_STAGE_MAP,
  TARGET_DIRECTION_MAP,
  TARGET_MAJOR_MAP,
  SCHOOL_TYPE_PREFERENCE_MAP,
  RANKING_SENSITIVITY_MAP,
  CITY_PREFERENCE_MAP,
  PORTFOLIO_STATUS_MAP,
  PORTFOLIO_STYLE_MAP,
  ENGLISH_TEST_TYPE_MAP,
  BUDGET_RANGE_MAP,
  SCHOLARSHIP_NEED_MAP,
  PRIORITY_FACTOR_MAP,
  TARGET_INTAKE_MAP,
  getDeadlineDescription,
} from './profile-mappings';

export interface UserProfile {
  user_role?: string;
  user_type?: string;
  location?: string;
  target_degree?: string;
  current_education_stage?: string;
  interested_categories?: string[];
  target_directions?: string[];
  target_majors?: string[];
  target_countries?: string[];
  portfolio_status?: string;
  english_test_type?: string;
  english_test_score?: string;
  total_budget_range?: string;
  scholarship_need?: string;
  target_intake?: string;
  current_school?: string;
  current_major?: string;
  gpa_or_grade?: string;
  school_type_preference?: string[];
  ranking_sensitivity?: string;
  city_preference?: string;
  portfolio_style_tendency?: string[];
  favorite_artists_or_styles?: string;
  priority_factors?: string[];
  profile_completion_score?: number;
  onboarding_completed_at?: string;
  other_languages?: any;
  family_support_level?: string;
}

const ONBOARDING_ROLE_MAP: Record<string, string> = {
  student: '艺术学子',
  artist: '专业艺术家',
  collector: '艺术爱好者 / 收藏者',
};

const ONBOARDING_GOAL_MAP: Record<string, string> = {
  art_abroad: '准备艺术留学',
  postgraduate: '准备考研 / 升学',
  portfolio: '提升作品集',
  course_mentor: '找课程 / 导师',
  internship: '找实习 / 实训机会',
  global_news: '看国际艺术资讯',
  art_events: '参加艺术活动',
  show_artworks: '展示作品',
  apply_exhibition: '申请展览',
  brand_cooperation: '对接品牌合作',
  hotel_events: '参加高端酒店艺术活动',
  joint_project: '做联名项目',
  artwork_license: '出售作品 / 版权授权',
  industry_influence: '扩大行业影响力',
  art_salon: '参加艺术沙龙',
  private_view: '看展览 / 私享会',
  collect_artworks: '收藏艺术作品',
  meet_artists: '认识艺术家',
  art_market: '了解艺术市场',
  art_appreciation: '学习艺术鉴赏',
};

const ONBOARDING_STAGE_MAP: Record<string, string> = {
  exploring: '刚开始了解艺术留学 / 考研',
  target_ready: '已确定目标国家 / 学校',
  portfolio_preparing: '正在准备作品集',
  works_ready: '已有部分作品',
  applying: '正在申请中',
  admitted: '已录取 / 已在读',
  emerging_creator: '新锐创作者',
  portfolio_ready: '有完整作品集',
  exhibited: '有展览经历',
  commercial_experience: '有商业合作经历',
  stable_sales: '有稳定收藏 / 销售记录',
  mature_artist: '已有成熟艺术家履历',
  beginner: '刚开始了解艺术',
  frequent_exhibition: '经常看展',
  event_experience: '参加过艺术活动',
  collection_experience: '有收藏经验',
  market_focus: '关注艺术市场',
  high_end_circle: '希望进入高端艺术圈层',
};

const ONBOARDING_DIRECTION_MAP: Record<string, string> = {
  fine_art: '纯艺',
  fine_arts: '纯艺术',
  design: '设计',
  contemporary: '先锋 / 当代艺术',
  documentary: '纪实 / 影像',
  education_market: '教育 / 市场 / 空间',
};

function labelFromMaps(value: string): string {
  if (value.startsWith('event:')) {
    return value.replace(/^event:/, '活动偏好：');
  }
  if (value.startsWith('verification:')) {
    const intent = value.replace(/^verification:/, '');
    return intent === 'now' ? '愿意立即认证' : '暂不认证';
  }
  return (
    ONBOARDING_GOAL_MAP[value] ||
    ONBOARDING_STAGE_MAP[value] ||
    ONBOARDING_DIRECTION_MAP[value] ||
    TARGET_DIRECTION_MAP[value] ||
    TARGET_MAJOR_MAP[value] ||
    PRIORITY_FACTOR_MAP[value] ||
    value
  );
}

/**
 * 第一层：身份画像
 * 任何回答都需要的基础上下文
 */
export function formatIdentity(profile: UserProfile): string {
  const parts: string[] = [];
  
  // 角色和学位
  let roleDesc = '';
  if (profile.user_role && profile.target_degree) {
    const role = USER_ROLE_MAP[profile.user_role] || profile.user_role;
    const degree = TARGET_DEGREE_MAP[profile.target_degree] || profile.target_degree;
    roleDesc = `一位计划申请${degree}的${role}`;
  } else if (profile.user_role) {
    roleDesc = ONBOARDING_ROLE_MAP[profile.user_role] || USER_ROLE_MAP[profile.user_role] || profile.user_role;
  } else if (profile.user_type) {
    roleDesc = ONBOARDING_ROLE_MAP[profile.user_type] || profile.user_type;
  } else if (profile.target_degree) {
    roleDesc = `计划申请${TARGET_DEGREE_MAP[profile.target_degree] || profile.target_degree}`;
  }
  
  if (roleDesc) parts.push(roleDesc);
  
  // 当前阶段
  if (profile.current_education_stage) {
    const stage =
      ONBOARDING_STAGE_MAP[profile.current_education_stage] ||
      CURRENT_EDUCATION_STAGE_MAP[profile.current_education_stage];
    if (stage) parts.push(`目前${stage}`);
  }
  
  // 目标专业
  if (profile.target_majors && profile.target_majors.length > 0) {
    const majors = profile.target_majors
      .map(m => TARGET_MAJOR_MAP[m] || m)
      .join('、');
    parts.push(`目标专业是${majors}`);
  } else if (profile.target_directions && profile.target_directions.length > 0) {
    const directions = profile.target_directions
      .map(d => ONBOARDING_DIRECTION_MAP[d] || TARGET_DIRECTION_MAP[d] || d)
      .join('、');
    parts.push(`目标方向是${directions}`);
  }

  if (profile.location && !profile.city_preference) {
    parts.push(`主要活动城市是${profile.location}`);
  }
  
  // 目标国家
  if (profile.target_countries && profile.target_countries.length > 0) {
    const countries = profile.target_countries.join('、');
    parts.push(`主要考虑${countries}的院校`);
  }
  
  // 目标入学时间
  if (profile.target_intake) {
    const intake = TARGET_INTAKE_MAP[profile.target_intake];
    if (intake) parts.push(`计划${intake}入学`);
  }
  
  if (parts.length === 0) return '';
  
  return parts.join('，') + '。';
}

/**
 * 第二层：硬约束
 * 用于过滤和警示的边界条件
 */
export function formatConstraints(profile: UserProfile): string {
  const parts: string[] = [];
  
  // 预算
  if (profile.total_budget_range) {
    const budget = BUDGET_RANGE_MAP[profile.total_budget_range] || profile.total_budget_range;
    parts.push(`总预算${budget}`);
  }
  
  // 奖学金需求
  if (profile.scholarship_need) {
    const need = SCHOLARSHIP_NEED_MAP[profile.scholarship_need];
    if (need && profile.scholarship_need !== 'not_needed') {
      parts.push(need);
    }
  }
  
  // 英语成绩
  if (profile.english_test_score) {
    let testDesc = profile.english_test_score;
    if (profile.english_test_type) {
      const testType = ENGLISH_TEST_TYPE_MAP[profile.english_test_type];
      if (testType) testDesc = `${testType} ${profile.english_test_score}`;
    }
    parts.push(testDesc);
  } else if (profile.english_test_type) {
    const testType = ENGLISH_TEST_TYPE_MAP[profile.english_test_type];
    if (testType && profile.english_test_type !== 'not_planned') {
      parts.push(testType);
    }
  }
  
  // 作品集状态
  if (profile.portfolio_status) {
    const status =
      ONBOARDING_STAGE_MAP[profile.portfolio_status] ||
      PORTFOLIO_STATUS_MAP[profile.portfolio_status];
    if (status) parts.push(`作品集${status}`);
  }
  
  // 申请时间窗
  if (profile.target_intake) {
    const deadline = getDeadlineDescription(profile.target_intake);
    if (deadline) parts.push(deadline);
  }
  
  // GPA
  if (profile.gpa_or_grade) {
    parts.push(`GPA/成绩 ${profile.gpa_or_grade}`);
  }
  
  if (parts.length === 0) return '';
  
  return parts.join('，') + '。';
}

/**
 * 第三层：软偏好
 * 用于排序和措辞调整的个性化信号
 */
export function formatPreferences(profile: UserProfile, mode: 'full' | 'partial_portfolio' = 'full'): string {
  const parts: string[] = [];

  if (profile.interested_categories && profile.interested_categories.length > 0) {
    const categories = profile.interested_categories.map(labelFromMaps).join('、');
    parts.push(`onboarding 中选择的艺术方向/标签：${categories}`);
  }
  
  // 作品集风格倾向
  if (profile.portfolio_style_tendency && profile.portfolio_style_tendency.length > 0) {
    const styles = profile.portfolio_style_tendency
      .map(s => PORTFOLIO_STYLE_MAP[s] || s)
      .join('、');
    parts.push(`作品集风格倾向${styles}`);
  }
  
  // 喜欢的艺术家/风格（原文注入）
  if (profile.favorite_artists_or_styles) {
    parts.push(profile.favorite_artists_or_styles);
  }
  
  // 如果是 partial_portfolio 模式，只返回作品集相关偏好
  if (mode === 'partial_portfolio') {
    return parts.length > 0 ? parts.join('，') + '。' : '';
  }
  
  // 学校类型偏好
  if (profile.school_type_preference && profile.school_type_preference.length > 0) {
    const types = profile.school_type_preference
      .map(t => SCHOOL_TYPE_PREFERENCE_MAP[t] || t)
      .join('、');
    parts.push(`偏好${types}`);
  }
  
  // 排名敏感度
  if (profile.ranking_sensitivity) {
    const sensitivity = RANKING_SENSITIVITY_MAP[profile.ranking_sensitivity];
    if (sensitivity) parts.push(sensitivity);
  }
  
  // 城市偏好
  if (profile.city_preference) {
    const city = CITY_PREFERENCE_MAP[profile.city_preference] || profile.city_preference;
    if (city) parts.push(city);
  }
  
  // 关注优先级排序（用句式强化）
  if (profile.priority_factors && profile.priority_factors.length > 0) {
    const factors = profile.priority_factors.map(labelFromMaps);
    let priorityDesc = '在选校时';
    
    if (factors.length === 1) {
      priorityDesc += `最看重${factors[0]}`;
    } else if (factors.length === 2) {
      priorityDesc += `最看重${factors[0]}，其次是${factors[1]}`;
    } else if (factors.length >= 3) {
      priorityDesc += `最看重${factors[0]}，其次是${factors[1]}，再次是${factors[2]}`;
      if (factors.length > 3) {
        priorityDesc += `，${factors.slice(3).join('、')}相对靠后`;
      }
    }
    
    parts.push(priorityDesc);
  }

  if (typeof profile.profile_completion_score === 'number') {
    parts.push(`艺术画像完整度约 ${profile.profile_completion_score}%`);
  }
  
  if (parts.length === 0) return '';
  
  return parts.join('，') + '。';
}

/**
 * 组装完整的用户画像段落（带三级标题）
 */
export function formatFullProfile(
  profile: UserProfile,
  slots: {
    identity: boolean;
    constraints: boolean;
    preferences: 'full' | 'partial_portfolio' | 'none';
  }
): string {
  const sections: string[] = [];
  
  if (slots.identity) {
    const identity = formatIdentity(profile);
    if (identity) {
      sections.push(`### 身份与目标\n${identity}`);
    }
  }
  
  if (slots.constraints) {
    const constraints = formatConstraints(profile);
    if (constraints) {
      sections.push(`### 申请约束（必须遵守）\n${constraints}`);
    }
  }
  
  if (slots.preferences !== 'none') {
    const preferences = formatPreferences(profile, slots.preferences);
    if (preferences) {
      sections.push(`### 风格偏好与关注点\n${preferences}`);
    }
  }
  
  if (sections.length === 0) return '';
  
  return `## 用户画像\n\n${sections.join('\n\n')}`;
}
