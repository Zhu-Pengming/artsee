import { NextRequest, NextResponse } from 'next/server';
import { getUserFromBearer } from '@/lib/api/auth-user';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    
    if (!user) {
      return NextResponse.json(
        { message: '未登录，请先登录' },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('获取用户资料失败:', error);
      return NextResponse.json(
        { message: error.message || '获取失败' },
        { status: 500 }
      );
    }

    console.log('📖 GET profile - 完成度:', profile?.profile_completion_score);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: profile?.nickname || user.user_metadata?.username || "",
      targetCountries: profile?.target_countries || [],
      targetMajors: profile?.target_majors || [],
      budgetRange: profile?.total_budget_range || "",
      languageLevel: profile?.english_test_score || "",
      timeline: profile?.target_intake || "",
      profile_completion_score: profile?.profile_completion_score || 0,
      // 完整的用户画像数据
      userRole: profile?.user_role || null,
      userType: profile?.user_type || null,
      targetDegree: profile?.target_degree || null,
      currentEducationStage: profile?.current_education_stage || null,
      currentSchool: profile?.current_school || null,
      currentMajor: profile?.current_major || null,
      targetDirections: profile?.target_directions || [],
      schoolTypePreference: profile?.school_type_preference || null,
      rankingSensitivity: profile?.ranking_sensitivity || null,
      cityPreference: profile?.city_preference || null,
      portfolioStatus: profile?.portfolio_status || null,
      portfolioStyleTendency: profile?.portfolio_style_tendency || null,
      englishTestType: profile?.english_test_type || null,
      englishTestScore: profile?.english_test_score || null,
      otherLanguages: profile?.other_languages || null,
      totalBudgetRange: profile?.total_budget_range || null,
      scholarshipNeed: profile?.scholarship_need || null,
      familySupportLevel: profile?.family_support_level || null,
      targetIntake: profile?.target_intake || null,
      favoriteArtistsOrStyles: profile?.favorite_artists_or_styles || null,
      priorityFactors: profile?.priority_factors || null,
      onboardingCompletedAt: profile?.onboarding_completed_at || null,
    });
  } catch (error: any) {
    console.error('获取用户资料错误:', error);
    return NextResponse.json(
      { message: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/auth/profile
 * 彻底清空用户画像数据
 * 
 * 用途:
 * 1. 用户主动清空画像(重新开始)
 * 2. GDPR 合规(被遗忘权)
 * 
 * 级联清除:
 * - user_profiles 画像字段重置
 * - memory_extractions 审计记录删除
 * - user_memory_chunks 语义记忆删除
 * - memory_staging 暂存记录删除
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    
    if (!user) {
      return NextResponse.json(
        { message: '未登录，请先登录' },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 删除 memory_extractions
    const { error: extractionsError } = await supabase
      .from('memory_extractions')
      .delete()
      .eq('user_id', user.id);

    if (extractionsError) {
      console.error('Failed to delete memory_extractions:', extractionsError);
    }

    // 2. 删除 user_memory_chunks
    const { error: memoriesError } = await supabase
      .from('user_memory_chunks')
      .delete()
      .eq('user_id', user.id);

    if (memoriesError) {
      console.error('Failed to delete user_memory_chunks:', memoriesError);
    }

    // 3. 删除 memory_staging
    const { error: stagingError } = await supabase
      .from('memory_staging')
      .delete()
      .eq('user_id', user.id);

    if (stagingError) {
      console.error('Failed to delete memory_staging:', stagingError);
    }

    // 4. 重置 user_profiles 画像字段(保留基础字段如 nickname/avatar)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        user_role: null,
        target_degree: null,
        current_education_stage: null,
        target_directions: null,
        target_majors: null,
        target_countries: null,
        school_type_preference: null,
        ranking_sensitivity: null,
        city_preference: null,
        portfolio_status: null,
        portfolio_style_tendency: null,
        english_test_type: null,
        english_test_score: null,
        other_languages: null,
        total_budget_range: null,
        scholarship_need: null,
        family_support_level: null,
        target_intake: null,
        current_school: null,
        current_major: null,
        gpa_or_grade: null,
        favorite_artists_or_styles: null,
        priority_factors: null,
        profile_completion_score: 0,
        onboarding_completed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      return NextResponse.json(
        { message: '清空画像失败', error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '画像已彻底清空',
    });
  } catch (error: any) {
    console.error('[DELETE /api/v1/auth/profile] Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
