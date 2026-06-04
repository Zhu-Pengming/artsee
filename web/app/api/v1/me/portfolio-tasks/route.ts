import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

async function loadGroups(supabase: ReturnType<typeof createServiceClient>, userId: string) {
  const { data: groups, error: groupError } = await supabase
    .from("portfolio_task_groups")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (groupError) throw groupError;
  const { data: tasks, error: taskError } = await supabase
    .from("portfolio_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (taskError) throw taskError;
  return (groups ?? []).map((group) => ({
    ...group,
    tasks: (tasks ?? []).filter((task) => task.group_id === group.id),
  }));
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("target_directions,portfolio_status")
      .eq("id", user.id)
      .maybeSingle();
    const groups = await loadGroups(supabase, user.id);
    const hasDirections = Array.isArray(profile?.target_directions) && profile.target_directions.length > 0;
    const state = groups.length > 0 ? "generated" : hasDirections ? "ready_to_generate" : "need_profile";
    return NextResponse.json({ success: true, data: { state, profile, groups } });
  } catch (e) {
    return errorResponse(e);
  }
}
