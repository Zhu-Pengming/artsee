/**
 * 用户画像加载工具 - 统一的画像读取入口
 * 
 * 任何 AI 路由要读 user_profiles,只能通过此模块。
 * 绝不允许在路由里裸写 supabase 查询。
 */

import { createClient } from '@/lib/supabase/server';
import type { UserProfile } from '@/lib/supabase/types';
import type { UserProfile as FormatterUserProfile } from './profile-formatter';

const LOAD_TIMEOUT_MS = 200;

/**
 * 加载用户画像(带超时降级)
 * 
 * @param userId - 用户 ID
 * @param timeoutMs - 超时时间(默认 200ms),超时返回 null
 * @returns 用户画像或 null(用户不存在/超时/错误)
 */
export async function loadUserProfile(
  userId: string,
  timeoutMs: number = LOAD_TIMEOUT_MS
): Promise<FormatterUserProfile | null> {
  try {
    const supabase = await createClient();
    
    // 创建超时 Promise
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    });
    
    // 创建查询 Promise
    const queryPromise = supabase
      .from('user_profiles')
      .select(`
        user_role,
        target_degree,
        current_education_stage,
        target_directions,
        target_majors,
        target_countries,
        portfolio_status,
        english_test_type,
        english_test_score,
        total_budget_range,
        scholarship_need,
        target_intake,
        current_school,
        current_major,
        gpa_or_grade,
        school_type_preference,
        ranking_sensitivity,
        city_preference,
        portfolio_style_tendency,
        favorite_artists_or_styles,
        priority_factors,
        family_support_level,
        other_languages
      `)
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) return null;
        return data as Partial<UserProfile>;
      });
    
    // 竞速:查询 vs 超时
    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    if (!result) {
      console.warn(`[loadUserProfile] Timeout or not found for user ${userId}`);
      return null;
    }
    
    // 转换为 FormatterUserProfile 格式(null → undefined)
    return {
      user_role: result.user_role ?? undefined,
      target_degree: result.target_degree ?? undefined,
      current_education_stage: result.current_education_stage ?? undefined,
      target_directions: result.target_directions ?? undefined,
      target_majors: result.target_majors ?? undefined,
      target_countries: result.target_countries ?? undefined,
      portfolio_status: result.portfolio_status ?? undefined,
      english_test_type: result.english_test_type ?? undefined,
      english_test_score: result.english_test_score ?? undefined,
      total_budget_range: result.total_budget_range ?? undefined,
      scholarship_need: result.scholarship_need ?? undefined,
      target_intake: result.target_intake ?? undefined,
      current_school: result.current_school ?? undefined,
      current_major: result.current_major ?? undefined,
      gpa_or_grade: result.gpa_or_grade ?? undefined,
      school_type_preference: result.school_type_preference ?? undefined,
      ranking_sensitivity: result.ranking_sensitivity ?? undefined,
      city_preference: result.city_preference ?? undefined,
      portfolio_style_tendency: result.portfolio_style_tendency ?? undefined,
      favorite_artists_or_styles: result.favorite_artists_or_styles ?? undefined,
      priority_factors: result.priority_factors ?? undefined,
      family_support_level: result.family_support_level ?? undefined,
      other_languages: result.other_languages ?? undefined,
    };
  } catch (error) {
    console.error('[loadUserProfile] Error:', error);
    return null;
  }
}
