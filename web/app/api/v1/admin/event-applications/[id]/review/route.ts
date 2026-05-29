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
    if (!["approved", "rejected", "waitlisted", "pending_payment", "registered"].includes(status)) {
      return NextResponse.json({ success: false, error: "无效审核状态" }, { status: 400 });
    }
    const patch: Record<string, unknown> = {
      status,
      review_note: body.review_note ?? null,
      reviewer_id: admin.user.id,
      reviewed_at: new Date().toISOString(),
    };
    if (["approved", "registered"].includes(status)) {
      patch.ticket_code = body.ticket_code ?? `EVT-${Date.now().toString(36).toUpperCase()}`;
    }
    const { data, error } = await createServiceClient()
      .from("event_applications")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
