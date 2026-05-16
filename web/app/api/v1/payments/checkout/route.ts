import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { createServiceClient } from "@/lib/api/supabase-service";

const MAX_AMOUNT = 2_000_000;
const STRIPE_API_VERSION = "2026-04-22.dahlia";

type CheckoutBody = {
  subject?: string;
  itemType?: string;
  itemId?: string;
  amountTotal?: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
};

function buildOrderNo() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AQ${Date.now()}${suffix}`;
}

function normalizeCurrency(raw: unknown) {
  const currency = String(raw || "cny").trim().toLowerCase();
  return /^[a-z]{3}$/.test(currency) ? currency : null;
}

function publicOrigin(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  try {
    const limited = checkRateLimit(req, {
      keyPrefix: "payments-checkout",
      windowMs: 60_000,
      max: 10,
    });
    if (!limited.ok) {
      return NextResponse.json({ success: false, error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ success: false, error: "未配置 STRIPE_SECRET_KEY" }, { status: 503 });
    }

    const body = (await req.json()) as CheckoutBody;
    const subject = body.subject?.trim() || "Artiqore 服务订单";
    const itemType = body.itemType?.trim() || "service";
    const itemId = body.itemId?.trim() || null;
    const amountTotal = Number(body.amountTotal);
    const currency = normalizeCurrency(body.currency);

    if (!Number.isInteger(amountTotal) || amountTotal <= 0 || amountTotal > MAX_AMOUNT) {
      return NextResponse.json(
        { success: false, error: `amountTotal 必须是 1-${MAX_AMOUNT} 之间的整数分` },
        { status: 400 }
      );
    }
    if (!currency) {
      return NextResponse.json({ success: false, error: "currency 必须是 3 位小写货币代码" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const orderNo = buildOrderNo();
    const metadata = {
      ...(body.metadata && typeof body.metadata === "object" ? body.metadata : {}),
      item_type: itemType,
      item_id: itemId,
    };

    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_no: orderNo,
        subject,
        item_type: itemType,
        item_id: itemId,
        amount_total: amountTotal,
        currency,
        status: "pending",
        provider: "stripe",
        metadata,
      })
      .select()
      .single();

    if (insertError || !order) {
      return NextResponse.json({ success: false, error: insertError?.message || "创建订单失败" }, { status: 500 });
    }

    const origin = publicOrigin(req);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: STRIPE_API_VERSION });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.id,
      customer_email: user.email || undefined,
      success_url: body.successUrl || `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.cancelUrl || `${origin}/payment/cancel?order_id=${order.id}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountTotal,
            product_data: {
              name: subject,
              metadata: {
                order_id: order.id,
                order_no: orderNo,
                item_type: itemType,
                item_id: itemId || "",
              },
            },
          },
        },
      ],
      metadata: {
        order_id: order.id,
        order_no: orderNo,
        user_id: user.id,
        item_type: itemType,
        item_id: itemId || "",
      },
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "checkout_created",
        provider_checkout_session_id: session.id,
        provider_customer_id: typeof session.customer === "string" ? session.customer : null,
      })
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNo,
        sessionId: session.id,
        checkoutUrl: session.url,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
