/**
 * Query 改写 - 基于用户画像扩充检索关键词
 * 
 * 例:"作品集要几个项目" → "RCA 视觉传达 作品集 项目数量"
 */

import type { UserProfile } from './profile-formatter';

export interface RewriteResult {
  rewritten: boolean;
  originalQuery: string;
  rewrittenQuery: string;
  addedContext: string[];
}

/**
 * 基于用户画像改写检索 query
 * 
 * @param query - 原始用户问题
 * @param profile - 用户画像
 * @returns 改写结果
 */
export function rewriteQueryWithProfile(
  query: string,
  profile: UserProfile | null
): RewriteResult {
  if (!profile) {
    return {
      rewritten: false,
      originalQuery: query,
      rewrittenQuery: query,
      addedContext: [],
    };
  }

  const addedContext: string[] = [];
  let rewrittenQuery = query;

  // 1. 如果 query 提到"作品集"但没提学校/专业,注入目标学校和专业
  if (
    /作品集|portfolio/i.test(query) &&
    !/学校|院校|大学|college|university/i.test(query)
  ) {
    // 注入目标专业
    if (profile.target_majors && profile.target_majors.length > 0) {
      const major = profile.target_majors[0]; // 取第一个目标专业
      addedContext.push(major);
    }
    
    // 注入目标国家(可选)
    if (profile.target_countries && profile.target_countries.length > 0) {
      const country = profile.target_countries[0];
      addedContext.push(country);
    }
  }

  // 2. 如果 query 提到"申请要求"/"录取"但没提学校,注入目标学校
  if (
    /申请|录取|要求|条件|admission|requirement/i.test(query) &&
    !/学校|院校|大学|college|university/i.test(query)
  ) {
    if (profile.target_majors && profile.target_majors.length > 0) {
      addedContext.push(profile.target_majors[0]);
    }
  }

  // 3. 如果 query 提到"学费"/"费用"但没提国家,注入目标国家
  if (
    /学费|费用|tuition|cost|price/i.test(query) &&
    !/英国|美国|国家|UK|US|country/i.test(query)
  ) {
    if (profile.target_countries && profile.target_countries.length > 0) {
      addedContext.push(profile.target_countries[0]);
    }
  }

  // 4. 如果 query 提到"语言"/"雅思"/"托福"但没提分数,注入用户成绩
  if (
    /语言|雅思|托福|IELTS|TOEFL/i.test(query) &&
    profile.english_test_score
  ) {
    // 不直接注入分数到 query,但可以在后续 rerank 时用
    // 这里只记录有这个信息
  }

  // 构建改写后的 query
  if (addedContext.length > 0) {
    // 将上下文前置,让检索更精准
    rewrittenQuery = `${addedContext.join(' ')} ${query}`;
    return {
      rewritten: true,
      originalQuery: query,
      rewrittenQuery,
      addedContext,
    };
  }

  return {
    rewritten: false,
    originalQuery: query,
    rewrittenQuery: query,
    addedContext: [],
  };
}
