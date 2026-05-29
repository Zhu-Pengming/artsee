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
    const ticketCode = String(body.ticket_code || "");
    if (!ticketCode) return NextResponse.json({ success: false, error: "缺少核销码" }, { status: 400 });
    const supabase = createServiceClient();
    const { data: application, error: appError } = await supabase
      .from("event_applications")
      .select("*")
      .eq("event_id", id)
      .eq("ticket_code", ticketCode)
      .maybeSingle();
    if (appError) return errorResponse(appError);
    if (!application) return NextResponse.json({ success: false, error: "核销码无效" }, { status: 404 });
    const { data, error } = await supabase
      .from("event_checkins")
      .insert({
        event_id: id,
        user_id: application.user_id,
        ticket_code: ticketCode,
        checked_by: admin.user.id,
      })
      .select()
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
