import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/api/admin-audit";
import { createNotification } from "@/lib/api/notifications";
import { markOrderRefunded } from "@/lib/api/order-payments";
import { createProviderRefund } from "@/lib/api/payment-refunds";
import { requireAdmin } from "@/lib/api/require-admin";
import {
  errorResponse,
  invalidIdResponse,
  notFoundResponse,
} from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
type Row = Record<string, unknown>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REVIEW_STATUSES = new Set([
  "approved",
  "rejected",
  "processing",
  "succeeded",
  "failed",
  "canceled",
]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function notificationTitle(status: string) {
  return (
    {
      approved: "退款申请已通过",
      rejected: "退款申请未通过",
      processing: "退款处理中",
      succeeded: "退款已完成",
      failed: "退款处理失败",
      canceled: "退款申请已取消",
    } as Record<string, string>
  )[status] ?? "退款申请已更新";
}

function validateTransition(current: string, next: string) {
  if (current === "succeeded") return "已完成退款不可再次变更";
  if (next === "approved" && current !== "requested") return "只有待审核退款可通过";
  if (next === "processing" && !["requested", "approved", "failed"].includes(current)) {
    return "当前状态不可进入退款处理";
  }
  if (next === "succeeded" && !["requested", "approved", "processing"].includes(current)) {
    return "当前状态不可标记退款成功";
  }
  if (["rejected", "canceled"].includes(next) && ["processing", "succeeded"].includes(current)) {
    return "处理中或已完成退款不可拒绝或取消";
  }
  return null;
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
    const providerRefundId = cleanText(body.provider_refund_id ?? body.providerRefundId);
    if (!REVIEW_STATUSES.has(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "status 必须是 approved、rejected、processing、succeeded、failed 或 canceled",
        },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: refund, error: refundError } = await supabase
      .from("payment_refund_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (refundError) return errorResponse(refundError);
    if (!refund) return notFoundResponse();

    const currentStatus = cleanText(refund.status);
    const transitionError = validateTransition(currentStatus, status);
    if (transitionError) {
      return NextResponse.json({ success: false, error: transitionError }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", refund.order_id)
      .maybeSingle();
    if (orderError) return errorResponse(orderError);
    if (!order) return notFoundResponse();

    if (status === "succeeded" && cleanText(order.status) !== "paid") {
      return NextResponse.json(
        { success: false, error: "只有已支付订单可以标记退款成功" },
        { status: 400 }
      );
    }

    let nextStatus = status;
    const providerPatch: Row = {};
    const providerMetadataPatch: Row = {};
    if (status === "processing") {
      try {
        const providerRefund = await createProviderRefund(refund, order);
        nextStatus = providerRefund.status;
        providerPatch.provider = providerRefund.provider;
        providerPatch.provider_refund_id =
          providerRefund.providerRefundId || refund.provider_refund_id || null;
        providerMetadataPatch.provider_refund_response = providerRefund.raw ?? null;
      } catch (e) {
        return errorResponse(e);
      }
    }

    const now = new Date().toISOString();
    const patch: Row = {
      status: nextStatus,
      reviewed_by_user_id: admin.user.id,
      reviewed_at: now,
      review_note: reviewNote || null,
      provider: cleanText(refund.provider) || cleanText(order.provider) || null,
      provider_refund_id: providerRefundId || refund.provider_refund_id || null,
      metadata: {
        ...objectValue(refund.metadata),
        reviewed_by_user_id: admin.user.id,
        reviewed_at: now,
        ...providerMetadataPatch,
      },
      ...providerPatch,
    };
    if (["processing", "succeeded", "failed"].includes(nextStatus)) patch.processed_at = now;

    const { data: updatedRefund, error: updateError } = await supabase
      .from("payment_refund_requests")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (updateError) return errorResponse(updateError);

    let refundedOrder: Row | null = null;
    if (nextStatus === "succeeded") {
      const refunded = await markOrderRefunded(supabase, order, {
        refund_request_id: id,
        provider_refund_id:
          providerRefundId || cleanText(updatedRefund.provider_refund_id) || null,
      });
      if (refunded.error) return errorResponse(refunded.error);
      refundedOrder = refunded.data;
    }

    await createNotification(supabase, cleanText(refund.user_id), {
      title: notificationTitle(status),
      content: reviewNote || cleanText(order.subject) || null,
      type: "order_refund",
      metadata: {
        refund_request_id: id,
        order_id: refund.order_id,
        status: nextStatus,
      },
    });

    await writeAdminAuditLog(supabase, req, {
      actorUserId: admin.user.id,
      action: "refund.review",
      targetType: "payment_refund_request",
      targetId: id,
      targetLabel: cleanText(order.order_no) || null,
      metadata: {
        previous_status: currentStatus,
        requested_status: status,
        final_status: nextStatus,
        order_id: refund.order_id,
        amount: refund.amount,
        currency: refund.currency,
        provider_refund_id: cleanText(updatedRefund.provider_refund_id) || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRefund,
      order: refundedOrder,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
