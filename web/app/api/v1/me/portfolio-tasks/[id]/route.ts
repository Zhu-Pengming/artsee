import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { status?: string };
    const status = body.status === "done" ? "done" : "todo";
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("portfolio_tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
