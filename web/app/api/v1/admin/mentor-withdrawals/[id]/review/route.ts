import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/api/admin-audit";
import { createNotification } from "@/lib/api/notifications";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse, invalidIdResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
type Row = Record<string, unknown>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REVIEW_STATUSES = new Set(["approved", "rejected", "paid", "canceled"]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function mergeMetadata(current: unknown, patch: Row) {
  return {
    ...(current && typeof current === "object" && !Array.isArray(current)
      ? (current as Row)
      : {}),
    ...patch,
  };
}

function notificationTitle(status: string) {
  return (
    {
      approved: "提现申请已通过",
      rejected: "提现申请未通过",
      paid: "提现已打款",
      canceled: "提现申请已取消",
    } as Record<string, string>
  )[status] ?? "提现申请已更新";
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const body = (await req.json().catch(() => ({}))) as Row;
    const status = cleanText(body.status);
    const reviewNote = cleanText(body.review_note ?? body.reviewNote);
    if (!REVIEW_STATUSES.has(status)) {
      return NextResponse.json(
        { success: false, error: "status 必须是 approved、rejected、paid 或 canceled" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("mentor_withdrawal_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (withdrawalError) return errorResponse(withdrawalError);
    if (!withdrawal) return notFoundResponse();

    const currentStatus = cleanText(withdrawal.status);
    if (status === "paid" && !["approved", "requested"].includes(currentStatus)) {
      return NextResponse.json(
        { success: false, error: "只有待审核或已通过的提现申请可以标记打款" },
        { status: 400 }
      );
    }
    if (["approved", "rejected", "canceled"].includes(status) && currentStatus === "paid") {
      return NextResponse.json(
        { success: false, error: "已打款提现申请不可改回其他状态" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const patch: Row = {
      status,
      reviewed_by_user_id: admin.user.id,
      reviewed_at: now,
      review_note: reviewNote || null,
      metadata: mergeMetadata(withdrawal.metadata, {
        reviewed_by_user_id: admin.user.id,
        reviewed_at: now,
      }),
    };
    if (status === "paid") {
      patch.paid_by_user_id = admin.user.id;
      patch.paid_at = now;
    }

    const { data, error } = await supabase
      .from("mentor_withdrawal_requests")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return errorResponse(error);

    const { data: mentor } = await supabase
      .from("mentors")
      .select("user_id")
      .eq("id", data.mentor_id)
      .maybeSingle();
    await createNotification(supabase, cleanText(mentor?.user_id), {
      title: notificationTitle(status),
      content: reviewNote || null,
      type: "mentor_withdrawal",
      metadata: {
        mentor_withdrawal_id: id,
        status,
        amount: data.amount,
        currency: data.currency,
      },
    });

    await writeAdminAuditLog(supabase, req, {
      actorUserId: admin.user.id,
      action: "mentor_withdrawal.review",
      targetType: "mentor_withdrawal_request",
      targetId: id,
      metadata: {
        previous_status: currentStatus,
        final_status: status,
        mentor_id: data.mentor_id,
        amount: data.amount,
        currency: data.currency,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
