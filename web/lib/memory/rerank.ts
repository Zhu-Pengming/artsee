/**
 * Rerank - 基于用户画像对检索结果重排
 * 
 * 目标学校优先,排除掉用户明确不考虑的方向
 */

import type { UserProfile } from './profile-formatter';
import type { RetrievedChunk } from '@/lib/knowledge/retriever';

export interface RerankResult<T> {
  items: T[];
  reranked: boolean;
  boostCount: number;
  filterCount: number;
}

/**
 * 基于用户画像对知识库 chunks 重排
 * 
 * @param chunks - 原始检索结果
 * @param profile - 用户画像
 * @returns 重排后的结果
 */
export function rerankChunksWithProfile(
  chunks: RetrievedChunk[],
  profile: UserProfile | null
): RerankResult<RetrievedChunk> {
  if (!profile || chunks.length === 0) {
    return {
      items: chunks,
      reranked: false,
      boostCount: 0,
      filterCount: 0,
    };
  }

  let boostCount = 0;
  let filterCount = 0;

  // 1. 给每个 chunk 打分
  const scored = chunks.map((chunk) => {
    let score = chunk.similarity; // 基础分数是原始相似度
    let boosted = false;

    // 2. Boost:如果 chunk 来自用户目标国家的学校,+0.1
    if (profile.target_countries && profile.target_countries.length > 0) {
      const targetCountries = profile.target_countries.map((c) => c.toLowerCase());
      // 这里需要学校的国家信息,暂时通过 schoolName 粗判
      // 更精确的做法是在 retriever 里 join schools 表拿 country 字段
      const schoolNameLower = (chunk.schoolName || '').toLowerCase();
      if (targetCountries.some((country) => schoolNameLower.includes(country))) {
        score += 0.1;
        boosted = true;
      }
    }

    // 3. Boost:如果 chunk 的 heading 包含用户目标专业关键词,+0.15
    if (profile.target_majors && profile.target_majors.length > 0) {
      const headingLower = (chunk.headingPath || '').toLowerCase();
      const chunkTextLower = chunk.chunkText.toLowerCase();
      
      for (const major of profile.target_majors) {
        const majorLower = major.toLowerCase();
        if (headingLower.includes(majorLower) || chunkTextLower.includes(majorLower)) {
          score += 0.15;
          boosted = true;
          break;
        }
      }
    }

    if (boosted) boostCount++;

    return { chunk, score };
  });

  // 4. 按分数降序排序
  scored.sort((a, b) => b.score - a.score);

  // 5. 返回重排后的 chunks
  return {
    items: scored.map((s) => s.chunk),
    reranked: boostCount > 0,
    boostCount,
    filterCount,
  };
}

/**
 * 基于用户画像对学校列表重排(用于 schools/search)
 * 
 * @param schools - 原始学校列表
 * @param profile - 用户画像
 * @returns 重排后的结果
 */
export function rerankSchoolsWithProfile<T extends { country?: string | null; name_en?: string | null }>(
  schools: T[],
  profile: UserProfile | null
): RerankResult<T> {
  if (!profile || schools.length === 0) {
    return {
      items: schools,
      reranked: false,
      boostCount: 0,
      filterCount: 0,
    };
  }

  let boostCount = 0;
  let filterCount = 0;

  // 给每个学校打分
  const scored = schools.map((school) => {
    let score = 0.5; // 基础分数
    let boosted = false;

    // Boost:如果学校在用户目标国家,+0.3
    if (profile.target_countries && profile.target_countries.length > 0 && school.country) {
      const targetCountries = profile.target_countries.map((c) => c.toLowerCase());
      if (targetCountries.includes(school.country.toLowerCase())) {
        score += 0.3;
        boosted = true;
      }
    }

    if (boosted) boostCount++;

    return { school, score };
  });

  // 按分数降序排序
  scored.sort((a, b) => b.score - a.score);

  return {
    items: scored.map((s) => s.school),
    reranked: boostCount > 0,
    boostCount,
    filterCount,
  };
}
