import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";

const VALID_CURRENCY_RE = /^[a-z]{3}$/;

function normalizeAmount(value: unknown) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : 0;
}

function normalizeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function makeOrderNo() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AQ${stamp}${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const body = await req.json();
    const subject = normalizeText(body.subject, "");
    const amountTotal = normalizeAmount(body.amountTotal ?? body.amount_total);
    const currency = normalizeText(body.currency, "cny").toLowerCase();
    const itemType = normalizeText(body.itemType ?? body.item_type, "service");
    const rawItemId = body.itemId ?? body.item_id;
    const itemId = typeof rawItemId === "string" && rawItemId.trim() ? rawItemId.trim() : null;
    const metadata = body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? body.metadata
      : {};

    if (!subject) {
      return NextResponse.json({ success: false, error: "订单标题不能为空" }, { status: 400 });
    }
    if (!amountTotal) {
      return NextResponse.json({ success: false, error: "订单金额必须大于 0" }, { status: 400 });
    }
    if (!VALID_CURRENCY_RE.test(currency)) {
      return NextResponse.json({ success: false, error: "币种格式无效" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_no: makeOrderNo(),
        subject,
        item_type: itemType,
        item_id: itemId,
        amount_total: amountTotal,
        currency,
        status: "checkout_created",
        provider: "internal",
        metadata,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNo: order.order_no,
        status: order.status,
        checkoutUrl: `/orders/${order.id}`,
        order,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg || "服务器错误" }, { status: 500 });
  }
}
