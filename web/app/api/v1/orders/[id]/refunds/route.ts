import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import {
  errorResponse,
  invalidIdResponse,
  notFoundResponse,
  parsePagination,
} from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
type Row = Record<string, unknown>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIVE_REFUND_STATUSES = ["requested", "approved", "processing", "succeeded"];

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function intValue(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (orderError) return errorResponse(orderError);
    if (!order) return notFoundResponse();

    const { data, error, count } = await supabase
      .from("payment_refund_requests")
      .select("*", { count: "exact" })
      .eq("order_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
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

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const body = (await req.json().catch(() => ({}))) as Row;
    const reason = cleanText(body.reason);
    const requestedAmount = intValue(body.amount);
    const supabase = createServiceClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (orderError) return errorResponse(orderError);
    if (!order) return notFoundResponse();
    if (cleanText(order.status) !== "paid") {
      return NextResponse.json(
        { success: false, error: "只有已支付订单可以申请退款" },
        { status: 400 }
      );
    }

    const orderAmount = intValue(order.amount_total);
    const amount = requestedAmount || orderAmount;
    if (amount !== orderAmount) {
      return NextResponse.json(
        { success: false, error: "当前版本仅支持整单退款" },
        { status: 400 }
      );
    }

    const { data: activeRefunds, error: refundError } = await supabase
      .from("payment_refund_requests")
      .select("id,status")
      .eq("order_id", id)
      .eq("user_id", user.id)
      .in("status", ACTIVE_REFUND_STATUSES)
      .limit(1);
    if (refundError) return errorResponse(refundError);
    if ((activeRefunds ?? []).length > 0) {
      return NextResponse.json(
        { success: false, error: "该订单已有进行中的退款申请" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("payment_refund_requests")
      .insert({
        order_id: id,
        user_id: user.id,
        amount,
        currency: cleanText(order.currency) || "cny",
        reason: reason || null,
        status: "requested",
        provider: cleanText(order.provider) || null,
        metadata: {
          order_status_at_request: order.status,
          order_item_type: order.item_type,
          order_item_id: order.item_id,
        },
      })
      .select("*")
      .single();
    if (error) return errorResponse(error);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
