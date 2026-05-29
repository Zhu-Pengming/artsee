import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const status = String(body.status || "");
    if (!["reviewing", "approved", "rejected", "interview", "contracting", "executing", "completed"].includes(status)) {
      return NextResponse.json({ success: false, error: "无效合作申请状态" }, { status: 400 });
    }
    const { data, error } = await createServiceClient()
      .from("opportunity_applications")
      .update({
        status,
        review_note: body.review_note ?? null,
        reviewer_id: admin.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
