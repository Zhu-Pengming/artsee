import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });

    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("has_completed_onboarding,target_directions,portfolio_status,city_preference")
      .eq("id", user.id)
      .maybeSingle();
    const { count: savedSchoolCount } = await supabase
      .from("saved_schools")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    const { data: plan, error: planError } = await supabase
      .from("application_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (planError) return errorResponse(planError);

    let tasks: unknown[] = [];
    if (plan?.id) {
      const { data, error } = await supabase
        .from("application_plan_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("plan_id", plan.id)
        .order("sort_order", { ascending: true });
      if (error) return errorResponse(error);
      tasks = data ?? [];
    }

    const hasProfile = Boolean(profile?.has_completed_onboarding);
    const hasSchools = (savedSchoolCount ?? 0) > 0;
    const state = plan ? "generated" : !hasProfile ? "no_profile" : !hasSchools ? "no_schools" : "ready_to_generate";

    return NextResponse.json({
      success: true,
      data: {
        state,
        profile,
        saved_school_count: savedSchoolCount ?? 0,
        plan,
        tasks,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
