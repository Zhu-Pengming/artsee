import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/api/admin-audit";
import { writeFinancialLedgerEntries } from "@/lib/api/financial-ledger";
import { createNotification } from "@/lib/api/notifications";
import { createProviderPayoutBatch } from "@/lib/api/payment-payouts";
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
const PROCESS_STATUSES = new Set(["processing", "paid", "failed", "canceled"]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function itemStatus(batchStatus: string) {
  if (batchStatus === "paid") return "paid";
  if (batchStatus === "failed") return "failed";
  if (batchStatus === "canceled") return "canceled";
  return "processing";
}

function notificationTitle(status: string) {
  return status === "paid" ? "提现已打款" : "提现批次状态已更新";
}

function validateTransition(current: string, next: string) {
  if (current === "paid") return "已打款批次不可再次变更";
  if (next === "paid" && !["draft", "processing"].includes(current)) {
    return "只有草稿或处理中批次可以标记已打款";
  }
  if (next === "processing" && current !== "draft") {
    return "只有草稿批次可以进入处理中";
  }
  if (["failed", "canceled"].includes(next) && current === "paid") {
    return "已打款批次不可失败或取消";
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
    const providerBatchId = cleanText(body.provider_batch_id ?? body.providerBatchId);
    const notes = cleanText(body.notes);
    if (!PROCESS_STATUSES.has(status)) {
      return NextResponse.json(
        { success: false, error: "status 必须是 processing、paid、failed 或 canceled" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: batch, error: batchError } = await supabase
      .from("payout_batches")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (batchError) return errorResponse(batchError);
    if (!batch) return notFoundResponse();

    const transitionError = validateTransition(cleanText(batch.status), status);
    if (transitionError) {
      return NextResponse.json({ success: false, error: transitionError }, { status: 400 });
    }

    const { data: items, error: itemsError } = await supabase
      .from("payout_batch_items")
      .select("*")
      .eq("batch_id", id);
    if (itemsError) return errorResponse(itemsError);
    if ((items ?? []).length === 0) {
      return NextResponse.json(
        { success: false, error: "批次内没有打款项" },
        { status: 400 }
      );
    }

    let nextStatus = status;
    const providerPatch: Row = {};
    const providerMetadataPatch: Row = {};
    if (status === "processing") {
      try {
        const providerPayout = await createProviderPayoutBatch(batch, items ?? []);
        nextStatus = providerPayout.status;
        providerPatch.provider = providerPayout.provider;
        providerPatch.provider_batch_id =
          providerPayout.providerBatchId || providerBatchId || batch.provider_batch_id || null;
        providerMetadataPatch.provider_payout_response = providerPayout.raw ?? null;
      } catch (e) {
        return errorResponse(e);
      }
    }

    const now = new Date().toISOString();
    const { data: updatedBatch, error: updateBatchError } = await supabase
      .from("payout_batches")
      .update({
        status: nextStatus,
        processed_by_user_id: admin.user.id,
        processed_at: now,
        provider_batch_id: providerBatchId || batch.provider_batch_id || null,
        metadata: {
          ...objectValue(batch.metadata),
          processed_by_user_id: admin.user.id,
          processed_at: now,
          ...providerMetadataPatch,
        },
        notes: notes || batch.notes || null,
        ...providerPatch,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (updateBatchError) return errorResponse(updateBatchError);

    const nextItemStatus = itemStatus(nextStatus);
    const { data: updatedItems, error: updateItemsError } = await supabase
      .from("payout_batch_items")
      .update({ status: nextItemStatus })
      .eq("batch_id", id)
      .select("*");
    if (updateItemsError) return errorResponse(updateItemsError);

    if (nextStatus === "paid") {
      for (const item of items ?? []) {
        const { data: withdrawal, error: withdrawalError } = await supabase
          .from("mentor_withdrawal_requests")
          .update({
            status: "paid",
            paid_by_user_id: admin.user.id,
            paid_at: now,
            metadata: {
              payout_batch_id: id,
              provider_batch_id:
                providerBatchId ||
                cleanText(updatedBatch.provider_batch_id) ||
                batch.provider_batch_id ||
                null,
            },
          })
          .eq("id", item.withdrawal_request_id)
          .select("*")
          .single();
        if (withdrawalError) return errorResponse(withdrawalError);

        const { data: mentor } = await supabase
          .from("mentors")
          .select("user_id")
          .eq("id", item.mentor_id)
          .maybeSingle();
        await createNotification(supabase, cleanText(mentor?.user_id), {
          title: notificationTitle(nextStatus),
          content: notes || null,
          type: "mentor_withdrawal",
          metadata: {
            mentor_withdrawal_id: withdrawal.id,
            payout_batch_id: id,
            status: "paid",
            amount: withdrawal.amount,
            currency: withdrawal.currency,
          },
        });

        await writeFinancialLedgerEntries(supabase, [
          {
            entryType: "payout_paid",
            account: "payouts",
            sourceType: "payout_batch",
            sourceId: id,
            userId: cleanText(mentor?.user_id),
            mentorId: cleanText(item.mentor_id),
            amount: Number(withdrawal.amount) || 0,
            currency: cleanText(withdrawal.currency) || "cny",
            occurredAt: now,
            metadata: {
              mentor_withdrawal_id: withdrawal.id,
              provider_batch_id:
                providerBatchId ||
                cleanText(updatedBatch.provider_batch_id) ||
                batch.provider_batch_id ||
                null,
            },
          },
        ]);
      }
    }

    await writeAdminAuditLog(supabase, req, {
      actorUserId: admin.user.id,
      action: "payout_batch.process",
      targetType: "payout_batch",
      targetId: id,
      targetLabel: cleanText(updatedBatch.batch_no) || null,
      metadata: {
        previous_status: cleanText(batch.status),
        requested_status: status,
        final_status: nextStatus,
        provider: cleanText(updatedBatch.provider) || null,
        provider_batch_id: cleanText(updatedBatch.provider_batch_id) || null,
        total_amount: updatedBatch.total_amount,
        item_count: updatedBatch.item_count,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedBatch,
      items: updatedItems ?? [],
    });
  } catch (e) {
    return errorResponse(e);
  }
}
