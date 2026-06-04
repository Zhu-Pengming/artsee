import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

const DEFAULT_TASKS = [
  ["6月", "确定目标院校"],
  ["6月", "整理作品集方向"],
  ["6月", "准备语言考试"],
  ["7月", "完成第一版作品集"],
  ["7月", "整理文书素材"],
  ["7月", "联系推荐人"],
  ["8月", "投递第一批项目"],
  ["8月", "检查申请材料"],
];

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const supabase = createServiceClient();

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("has_completed_onboarding,target_directions,portfolio_status")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.has_completed_onboarding) {
      return NextResponse.json({ success: false, code: "NO_PROFILE", error: "请先完善申请画像" }, { status: 400 });
    }

    const { count: savedSchoolCount } = await supabase
      .from("saved_schools")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if ((savedSchoolCount ?? 0) < 1) {
      return NextResponse.json({ success: false, code: "NO_SCHOOLS", error: "请先添加目标院校" }, { status: 400 });
    }

    const { data: plan, error: planError } = await supabase
      .from("application_plans")
      .insert({
        user_id: user.id,
        target_year: "2026 Fall",
        status: "active",
        summary: "根据你的画像和目标院校生成的第一版申请时间线。",
      })
      .select("*")
      .single();
    if (planError) return errorResponse(planError);

    const rows = DEFAULT_TASKS.map(([month, title], index) => ({
      plan_id: plan.id,
      user_id: user.id,
      month_label: month,
      title,
      status: "todo",
      sort_order: index,
    }));
    const { data: tasks, error: taskError } = await supabase
      .from("application_plan_tasks")
      .insert(rows)
      .select("*")
      .order("sort_order", { ascending: true });
    if (taskError) return errorResponse(taskError);

    return NextResponse.json({ success: true, data: { state: "generated", plan, tasks: tasks ?? [] } });
  } catch (e) {
    return errorResponse(e);
  }
}
