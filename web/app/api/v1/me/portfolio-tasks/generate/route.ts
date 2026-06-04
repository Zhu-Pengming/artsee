import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

const GROUPS = [
  ["方向确认", ["明确申请方向", "收集参考案例", "确定作品集主题"]],
  ["作品整理", ["上传已有作品", "筛选核心项目", "补充项目说明"]],
  ["作品集制作", ["完成封面目录", "统一视觉排版", "导出投递版本"]],
  ["投递检查", ["检查学校格式要求", "检查项目数量", "检查英文说明", "检查文件大小与命名"]],
];

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("target_directions")
      .eq("id", user.id)
      .maybeSingle();
    if (!Array.isArray(profile?.target_directions) || profile.target_directions.length === 0) {
      return NextResponse.json({ success: false, code: "NO_DIRECTIONS", error: "请先完善申请方向" }, { status: 400 });
    }

    await supabase.from("portfolio_task_groups").delete().eq("user_id", user.id);
    const { data: groups, error: groupError } = await supabase
      .from("portfolio_task_groups")
      .insert(GROUPS.map(([title], index) => ({ user_id: user.id, title, sort_order: index })))
      .select("*")
      .order("sort_order", { ascending: true });
    if (groupError) return errorResponse(groupError);

    const taskRows = (groups ?? []).flatMap((group, groupIndex) =>
      (GROUPS[groupIndex][1] as string[]).map((title, index) => ({
        group_id: group.id,
        user_id: user.id,
        title,
        status: "todo",
        sort_order: groupIndex * 100 + index,
      }))
    );
    const { data: tasks, error: taskError } = await supabase
      .from("portfolio_tasks")
      .insert(taskRows)
      .select("*")
      .order("sort_order", { ascending: true });
    if (taskError) return errorResponse(taskError);

    const data = (groups ?? []).map((group) => ({
      ...group,
      tasks: (tasks ?? []).filter((task) => task.group_id === group.id),
    }));
    return NextResponse.json({ success: true, data: { state: "generated", groups: data } });
  } catch (e) {
    return errorResponse(e);
  }
}
