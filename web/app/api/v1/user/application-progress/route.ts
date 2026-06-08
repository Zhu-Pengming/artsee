import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";

// GET /api/v1/user/application-progress - 获取用户申请准备进度
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "未授权" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = createServiceClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "无效的认证令牌" },
        { status: 401 }
      );
    }

    // 计算申请准备度（基于用户完成的各项任务）
    const checks = {
      profile_complete: false,
      portfolio_uploaded: false,
      language_test_scheduled: false,
      recommendation_letters: false,
      personal_statement: false,
    };

    // 检查用户资料完整度
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("nickname, bio, avatar_url")
      .eq("user_id", user.id)
      .single();
    
    if (profile?.nickname && profile?.bio) {
      checks.profile_complete = true;
    }

    // 检查作品集
    const { count: artworkCount } = await supabase
      .from("artworks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "published");
    
    if (artworkCount && artworkCount > 0) {
      checks.portfolio_uploaded = true;
    }

    const { count: targetSchoolCount, error: targetSchoolError } = await supabase
      .from("saved_schools")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (targetSchoolError) {
      return NextResponse.json(
        { success: false, error: targetSchoolError.message },
        { status: 500 }
      );
    }

    const { count: materialCount, error: materialError } = await supabase
      .from("application_plan_tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (materialError) {
      return NextResponse.json(
        { success: false, error: materialError.message },
        { status: 500 }
      );
    }

    const { count: completedMaterialCount, error: completedMaterialError } =
      await supabase
        .from("application_plan_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "done");
    if (completedMaterialError) {
      return NextResponse.json(
        { success: false, error: completedMaterialError.message },
        { status: 500 }
      );
    }

    // 计算完成百分比
    const completedCount = Object.values(checks).filter(Boolean).length;
    const totalCount = Object.keys(checks).length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    // 生成建议
    const suggestions = [];
    if (!checks.portfolio_uploaded) {
      suggestions.push("作品集叙事");
    }
    if (!checks.recommendation_letters) {
      suggestions.push("推荐信人选");
    }
    if (!checks.language_test_scheduled) {
      suggestions.push("语言考试日期");
    }

    return NextResponse.json({
      success: true,
      data: {
        percentage,
        checks,
        suggestions,
        target_school_count: targetSchoolCount ?? 0,
        material_count: materialCount ?? 0,
        completed_material_count: completedMaterialCount ?? 0,
        total_schools: 246,
        total_countries: 18,
        update_frequency: "周更",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
