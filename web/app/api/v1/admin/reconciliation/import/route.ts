import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/api/admin-audit";
import { createNotification } from "@/lib/api/notifications";
import { markOrderPaid, markOrderRefunded } from "@/lib/api/order-payments";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Row = Record<string, unknown>;
type Kind = "orders" | "refunds" | "payouts";
type MatchResult = {
  entityType?: "order" | "refund" | "payout_batch";
  entity?: Row | null;
  expectedAmount?: number | null;
};

const KINDS = new Set<Kind>(["orders", "refunds", "payouts"]);
const AUTO_APPLY_STATUSES = new Set(["paid", "succeeded", "success", "refunded", "completed"]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function textValue(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = cleanText(row[key]);
    if (value) return value;
  }
  return "";
}

function amountValue(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizedStatus(value: unknown) {
  return cleanText(value).toLowerCase();
}

function statusAllowsAutoApply(value: unknown) {
  return AUTO_APPLY_STATUSES.has(normalizedStatus(value));
}

function externalId(row: Row, kind: Kind) {
  if (kind === "orders") {
    return textValue(row, [
      "provider_payment_intent_id",
      "payment_intent_id",
      "payment_intent",
      "provider_checkout_session_id",
      "checkout_session_id",
      "order_no",
      "order_id",
      "id",
    ]);
  }
  if (kind === "refunds") {
    return textValue(row, ["provider_refund_id", "refund_id", "id"]);
  }
  return textValue(row, ["provider_batch_id", "batch_id", "payout_batch_id", "id"]);
}

async function findFirst(
  supabase: ReturnType<typeof createServiceClient>,
  table: string,
  filters: Array<[string, string]>
) {
  for (const [field, value] of filters) {
    if (!value) continue;
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq(field, value)
      .maybeSingle();
    if (error) return { error };
    if (data) return { data };
  }
  return { data: null };
}

async function matchRow(
  supabase: ReturnType<typeof createServiceClient>,
  kind: Kind,
  row: Row
): Promise<MatchResult & { error?: unknown }> {
  if (kind === "orders") {
    const found = await findFirst(supabase, "orders", [
      ["id", textValue(row, ["order_id"])],
      ["order_no", textValue(row, ["order_no"])],
      ["provider_payment_intent_id", textValue(row, ["provider_payment_intent_id", "payment_intent_id", "payment_intent"])],
      ["provider_checkout_session_id", textValue(row, ["provider_checkout_session_id", "checkout_session_id"])],
    ]);
    if (found.error) return { error: found.error };
    return {
      entityType: "order",
      entity: found.data as Row | null,
      expectedAmount: amountValue((found.data as Row | null)?.amount_total),
    };
  }
  if (kind === "refunds") {
    const found = await findFirst(supabase, "payment_refund_requests", [
      ["id", textValue(row, ["refund_request_id"])],
      ["provider_refund_id", textValue(row, ["provider_refund_id", "refund_id", "id"])],
    ]);
    if (found.error) return { error: found.error };
    return {
      entityType: "refund",
      entity: found.data as Row | null,
      expectedAmount: amountValue((found.data as Row | null)?.amount),
    };
  }
  const found = await findFirst(supabase, "payout_batches", [
    ["id", textValue(row, ["payout_batch_id"])],
    ["provider_batch_id", textValue(row, ["provider_batch_id", "batch_id", "id"])],
    ["batch_no", textValue(row, ["batch_no"])],
  ]);
  if (found.error) return { error: found.error };
  return {
    entityType: "payout_batch",
    entity: found.data as Row | null,
    expectedAmount: amountValue((found.data as Row | null)?.total_amount),
  };
}

async function applyPayoutPaid(
  supabase: ReturnType<typeof createServiceClient>,
  batch: Row,
  adminUserId: string,
  providerBatchId: string
) {
  const now = new Date().toISOString();
  const { data: items, error: itemsError } = await supabase
    .from("payout_batch_items")
    .select("*")
    .eq("batch_id", batch.id);
  if (itemsError) return { error: itemsError };

  const { error: batchError } = await supabase
    .from("payout_batches")
    .update({
      status: "paid",
      processed_by_user_id: adminUserId,
      processed_at: now,
      provider_batch_id: providerBatchId || batch.provider_batch_id || null,
    })
    .eq("id", batch.id)
    .select("*")
    .single();
  if (batchError) return { error: batchError };

  const { error: itemError } = await supabase
    .from("payout_batch_items")
    .update({ status: "paid" })
    .eq("batch_id", batch.id)
    .select("*");
  if (itemError) return { error: itemError };

  for (const item of items ?? []) {
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("mentor_withdrawal_requests")
      .update({
        status: "paid",
        paid_by_user_id: adminUserId,
        paid_at: now,
        metadata: {
          payout_batch_id: batch.id,
          provider_batch_id: providerBatchId || batch.provider_batch_id || null,
        },
      })
      .eq("id", item.withdrawal_request_id)
      .select("*")
      .single();
    if (withdrawalError) return { error: withdrawalError };

    const { data: mentor } = await supabase
      .from("mentors")
      .select("user_id")
      .eq("id", item.mentor_id)
      .maybeSingle();
    await createNotification(supabase, cleanText(mentor?.user_id), {
      title: "提现已打款",
      content: null,
      type: "mentor_withdrawal",
      metadata: {
        mentor_withdrawal_id: withdrawal.id,
        payout_batch_id: batch.id,
        status: "paid",
        amount: withdrawal.amount,
        currency: withdrawal.currency,
      },
    });
  }
  return { error: null };
}

async function autoApply(
  supabase: ReturnType<typeof createServiceClient>,
  kind: Kind,
  entity: Row,
  row: Row,
  adminUserId: string
) {
  if (!statusAllowsAutoApply(row.status ?? row.external_status)) return { applied: false };
  if (kind === "orders") {
    const paid = await markOrderPaid(supabase, entity, {
      provider: cleanText(row.provider) || cleanText(entity.provider) || null,
      providerCheckoutSessionId: textValue(row, ["provider_checkout_session_id", "checkout_session_id"]),
      providerPaymentIntentId: textValue(row, ["provider_payment_intent_id", "payment_intent_id", "payment_intent"]),
      providerCustomerId: textValue(row, ["provider_customer_id", "customer_id"]),
      metadata: {
        reconciliation_applied_at: new Date().toISOString(),
      },
    });
    return paid.error ? { error: paid.error } : { applied: true };
  }
  if (kind === "refunds") {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", entity.order_id)
      .maybeSingle();
    if (orderError) return { error: orderError };
    if (!order) return { error: new Error("order not found for refund") };

    const { error: refundUpdateError } = await supabase
      .from("payment_refund_requests")
      .update({
        status: "succeeded",
        provider_refund_id: textValue(row, ["provider_refund_id", "refund_id", "id"]) || entity.provider_refund_id || null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", entity.id)
      .select("*")
      .single();
    if (refundUpdateError) return { error: refundUpdateError };

    const refunded = await markOrderRefunded(supabase, order, {
      reconciliation_applied_at: new Date().toISOString(),
    });
    return refunded.error ? { error: refunded.error } : { applied: true };
  }
  const applied = await applyPayoutPaid(
    supabase,
    entity,
    adminUserId,
    textValue(row, ["provider_batch_id", "batch_id", "id"])
  );
  return applied.error ? { error: applied.error } : { applied: true };
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const body = (await req.json().catch(() => ({}))) as Row;
    const provider = cleanText(body.provider);
    const kind = cleanText(body.kind) as Kind;
    const rows = Array.isArray(body.rows) ? (body.rows as Row[]) : [];
    const sourceName = cleanText(body.source_name ?? body.sourceName);
    if (!provider) {
      return NextResponse.json({ success: false, error: "provider 不能为空" }, { status: 400 });
    }
    if (!KINDS.has(kind)) {
      return NextResponse.json({ success: false, error: "kind 必须是 orders、refunds 或 payouts" }, { status: 400 });
    }
    if (rows.length === 0 || rows.length > 500) {
      return NextResponse.json({ success: false, error: "rows 数量必须在 1 到 500 之间" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: run, error: runError } = await supabase
      .from("payment_reconciliation_runs")
      .insert({
        provider,
        kind,
        source_name: sourceName || null,
        row_count: rows.length,
        created_by_user_id: admin.user.id,
        metadata: objectValue(body.metadata),
      })
      .select("*")
      .single();
    if (runError) return errorResponse(runError);

    const items = [];
    let matched = 0;
    let unmatched = 0;
    let mismatch = 0;
    for (const row of rows) {
      const amount = amountValue(row.amount ?? row.amount_total ?? row.net_amount);
      const status = normalizedStatus(row.status ?? row.external_status);
      const match = await matchRow(supabase, kind, row);
      if (match.error) return errorResponse(match.error);
      const entity = match.entity;
      const expectedAmount = match.expectedAmount ?? null;
      let itemStatus: "matched" | "unmatched" | "mismatch" | "auto_applied" = "unmatched";
      let errorMessage: string | null = null;
      if (!entity) {
        unmatched += 1;
      } else if (amount != null && expectedAmount != null && amount !== expectedAmount) {
        itemStatus = "mismatch";
        errorMessage = "amount mismatch";
        mismatch += 1;
      } else {
        itemStatus = "matched";
        matched += 1;
        const applied = await autoApply(supabase, kind, entity, row, admin.user.id);
        if (applied.error) {
          itemStatus = "mismatch";
          errorMessage = cleanText((applied.error as { message?: unknown }).message) || "auto apply failed";
          mismatch += 1;
          matched -= 1;
        } else if (applied.applied) {
          itemStatus = "auto_applied";
        }
      }
      items.push({
        run_id: run.id,
        provider,
        kind,
        external_id: externalId(row, kind) || null,
        matched_entity_type: entity ? match.entityType : null,
        matched_entity_id: entity?.id ?? null,
        status: itemStatus,
        amount,
        expected_amount: expectedAmount,
        currency: cleanText(row.currency) || null,
        external_status: status || null,
        error_message: errorMessage,
        raw: row,
      });
    }

    const { data: insertedItems, error: itemsError } = await supabase
      .from("payment_reconciliation_items")
      .insert(items)
      .select("*");
    if (itemsError) return errorResponse(itemsError);

    const { data: updatedRun, error: updateRunError } = await supabase
      .from("payment_reconciliation_runs")
      .update({
        matched_count: matched,
        unmatched_count: unmatched,
        mismatch_count: mismatch,
      })
      .eq("id", run.id)
      .select("*")
      .single();
    if (updateRunError) return errorResponse(updateRunError);

    await writeAdminAuditLog(supabase, req, {
      actorUserId: admin.user.id,
      action: "reconciliation.import",
      targetType: "payment_reconciliation_run",
      targetId: run.id,
      targetLabel: sourceName || null,
      metadata: {
        provider,
        kind,
        row_count: rows.length,
        matched_count: matched,
        unmatched_count: unmatched,
        mismatch_count: mismatch,
        auto_applied_count: items.filter((item) => item.status === "auto_applied").length,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRun,
      items: insertedItems ?? [],
    });
  } catch (e) {
    return errorResponse(e);
  }
}
