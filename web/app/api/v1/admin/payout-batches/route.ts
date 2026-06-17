import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Row = Record<string, unknown>;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function textArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item))
    .filter((item) => item.length > 0);
}

function makeBatchNo() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PB${stamp}${rand}`;
}

function intValue(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("response" in admin) return admin.response;

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const status = cleanText(searchParams.get("status"));
    const supabase = createServiceClient();

    let query = supabase
      .from("payout_batches")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (status && status !== "all") query = query.eq("status", status);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);
    return NextResponse.json({
      success: true,
      data: data ?? [],
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const body = (await req.json().catch(() => ({}))) as Row;
    const withdrawalIds = Array.from(new Set(textArray(body.withdrawal_ids ?? body.withdrawalIds)));
    const notes = cleanText(body.notes);
    if (withdrawalIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "withdrawal_ids 不能为空" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: withdrawals, error: withdrawalError } = await supabase
      .from("mentor_withdrawal_requests")
      .select("*")
      .in("id", withdrawalIds);
    if (withdrawalError) return errorResponse(withdrawalError);
    if ((withdrawals ?? []).length !== withdrawalIds.length) {
      return NextResponse.json(
        { success: false, error: "部分提现申请不存在" },
        { status: 404 }
      );
    }

    const invalid = (withdrawals ?? []).find((row: Row) => cleanText(row.status) !== "approved");
    if (invalid) {
      return NextResponse.json(
        { success: false, error: "只能将已通过的提现申请加入打款批次" },
        { status: 400 }
      );
    }

    const currencies = new Set((withdrawals ?? []).map((row: Row) => cleanText(row.currency) || "cny"));
    if (currencies.size > 1) {
      return NextResponse.json(
        { success: false, error: "一个打款批次只能包含同一币种" },
        { status: 400 }
      );
    }

    const currency = Array.from(currencies)[0] ?? "cny";
    const totalAmount = (withdrawals ?? []).reduce(
      (sum: number, row: Row) => sum + intValue(row.amount),
      0
    );
    const { data: batch, error: batchError } = await supabase
      .from("payout_batches")
      .insert({
        batch_no: makeBatchNo(),
        status: "draft",
        currency,
        total_amount: totalAmount,
        item_count: withdrawals?.length ?? 0,
        created_by_user_id: admin.user.id,
        notes: notes || null,
        metadata: {
          withdrawal_ids: withdrawalIds,
        },
      })
      .select("*")
      .single();
    if (batchError) return errorResponse(batchError);

    const items = (withdrawals ?? []).map((row: Row) => ({
      batch_id: batch.id,
      withdrawal_request_id: row.id,
      mentor_id: row.mentor_id,
      amount: row.amount,
      currency: cleanText(row.currency) || "cny",
      status: "pending",
    }));
    const { data: batchItems, error: itemError } = await supabase
      .from("payout_batch_items")
      .insert(items)
      .select("*");
    if (itemError) return errorResponse(itemError);

    return NextResponse.json(
      {
        success: true,
        data: batch,
        items: batchItems ?? [],
      },
      { status: 201 }
    );
  } catch (e) {
    return errorResponse(e);
  }
}
