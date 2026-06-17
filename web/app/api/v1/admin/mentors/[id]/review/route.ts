import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/api/notifications";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse, invalidIdResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;
  try {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const status = cleanText(body.status);
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "status 必须是 approved 或 rejected" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const patch =
      status === "approved"
        ? {
            verification_status: "verified",
            status: "active",
            metadata: {
              reviewed_by_user_id: admin.user.id,
              reviewed_at: now,
              review_note: cleanText(body.review_note) || null,
            },
          }
        : {
            verification_status: "rejected",
            status: "rejected",
            metadata: {
              reviewed_by_user_id: admin.user.id,
              reviewed_at: now,
              review_note: cleanText(body.review_note) || null,
            },
          };

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("mentors")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return errorResponse(error);
    await createNotification(supabase, data.user_id?.toString(), {
      title: status === "approved" ? "导师认证已通过" : "导师认证未通过",
      content: cleanText(body.review_note) || null,
      type: "mentor_review",
      metadata: {
        mentor_id: id,
        status,
      },
    });
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
