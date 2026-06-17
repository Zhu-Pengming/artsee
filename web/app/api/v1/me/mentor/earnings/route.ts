import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Row = Record<string, unknown>;

function amount(row: Row) {
  const parsed = Number(row.net_amount ?? row.amount ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sum(rows: Row[], predicate: (row: Row) => boolean) {
  return rows.reduce((total, row) => total + (predicate(row) ? amount(row) : 0), 0);
}

function buildSummary(earnings: Row[], withdrawals: Row[]) {
  const pendingAmount = sum(earnings, (row) => row.status === "pending");
  const availableAmount = sum(earnings, (row) => row.status === "available");
  const withdrawnAmount = sum(earnings, (row) => row.status === "withdrawn");
  const requestedWithdrawalAmount = withdrawals.reduce((total, row) => {
    return row.status === "requested" || row.status === "approved"
      ? total + amount(row)
      : total;
  }, 0);
  const paidWithdrawalAmount = withdrawals.reduce((total, row) => {
    return row.status === "paid" ? total + amount(row) : total;
  }, 0);
  return {
    pending_amount: pendingAmount,
    available_amount: availableAmount,
    withdrawn_amount: withdrawnAmount + paidWithdrawalAmount,
    requested_withdrawal_amount: requestedWithdrawalAmount,
    withdrawable_amount: Math.max(
      0,
      availableAmount - requestedWithdrawalAmount - paidWithdrawalAmount
    ),
    currency: earnings[0]?.currency?.toString() ?? withdrawals[0]?.currency?.toString() ?? "cny",
  };
}

async function getOwnMentor(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string
) {
  return supabase
    .from("mentors")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status")?.trim();
    const supabase = createServiceClient();
    const { data: mentor, error: mentorError } = await getOwnMentor(
      supabase,
      auth.user.id
    );
    if (mentorError) return errorResponse(mentorError);
    if (!mentor) {
      return NextResponse.json({
        success: true,
        data: [],
        withdrawals: [],
        summary: buildSummary([], []),
        count: 0,
        pagination: { limit, offset },
      });
    }

    const { data: allEarnings, error: allEarningsError } = await supabase
      .from("mentor_earnings")
      .select("*")
      .eq("mentor_id", mentor.id);
    if (allEarningsError) return errorResponse(allEarningsError);

    const { data: withdrawals, error: withdrawalError } = await supabase
      .from("mentor_withdrawal_requests")
      .select("*")
      .eq("mentor_id", mentor.id)
      .order("created_at", { ascending: false });
    if (withdrawalError) return errorResponse(withdrawalError);

    let query = supabase
      .from("mentor_earnings")
      .select("*", { count: "exact" })
      .eq("mentor_id", mentor.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (status) query = query.eq("status", status);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data: data ?? [],
      withdrawals: withdrawals ?? [],
      summary: buildSummary(allEarnings ?? [], withdrawals ?? []),
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
