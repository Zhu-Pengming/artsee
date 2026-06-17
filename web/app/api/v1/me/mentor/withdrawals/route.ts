import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Row = Record<string, unknown>;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function positiveInt(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function amount(row: Row) {
  const parsed = Number(row.net_amount ?? row.amount ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function withdrawableAmount(earnings: Row[], withdrawals: Row[]) {
  const available = earnings.reduce(
    (total, row) => total + (row.status === "available" ? amount(row) : 0),
    0
  );
  const requested = withdrawals.reduce((total, row) => {
    return row.status === "requested" ||
      row.status === "approved" ||
      row.status === "paid"
      ? total + amount(row)
      : total;
  }, 0);
  return Math.max(0, available - requested);
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

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const body = (await req.json().catch(() => ({}))) as Row;
    const requestedAmount = positiveInt(body.amount ?? body.amount_total);
    const currency = (cleanText(body.currency) || "cny").toLowerCase();
    if (!requestedAmount) {
      return NextResponse.json(
        { success: false, error: "提现金额必须大于 0" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: mentor, error: mentorError } = await getOwnMentor(
      supabase,
      auth.user.id
    );
    if (mentorError) return errorResponse(mentorError);
    if (!mentor) {
      return NextResponse.json(
        { success: false, error: "请先提交导师认证申请" },
        { status: 403 }
      );
    }

    const { data: earnings, error: earningsError } = await supabase
      .from("mentor_earnings")
      .select("*")
      .eq("mentor_id", mentor.id);
    if (earningsError) return errorResponse(earningsError);

    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from("mentor_withdrawal_requests")
      .select("*")
      .eq("mentor_id", mentor.id);
    if (withdrawalsError) return errorResponse(withdrawalsError);

    const withdrawable = withdrawableAmount(earnings ?? [], withdrawals ?? []);
    if (requestedAmount > withdrawable) {
      return NextResponse.json(
        { success: false, error: "提现金额超过可提现余额" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("mentor_withdrawal_requests")
      .insert({
        mentor_id: mentor.id,
        requested_by_user_id: auth.user.id,
        amount: requestedAmount,
        currency,
        status: "requested",
        metadata:
          body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
            ? body.metadata
            : {},
      })
      .select("*")
      .single();

    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
