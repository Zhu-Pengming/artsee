import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { id } = await ctx.params;
    const { data, error } = await createServiceClient()
      .from("cooperation_projects")
      .select("id, opportunity_id, artist_id, business_id, contract_status, project_status, created_at, updated_at")
      .eq("id", id)
      .or(`artist_id.eq.${user.id},business_id.eq.${user.id}`)
      .maybeSingle();
    if (error) return errorResponse(error);
    if (!data) return NextResponse.json({ success: false, error: "未找到项目" }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { id } = await ctx.params;
    const body = await req.json();
    const status = String(body.project_status || body.status || "");
    if (!["pending", "active", "paused", "completed", "canceled"].includes(status)) {
      return NextResponse.json({ success: false, error: "无效项目状态" }, { status: 400 });
    }
    const { data, error } = await createServiceClient()
      .from("cooperation_projects")
      .update({ project_status: status })
      .eq("id", id)
      .eq("artist_id", user.id)
      .select()
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
