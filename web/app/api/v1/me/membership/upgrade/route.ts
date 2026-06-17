import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createCheckoutSession } from "@/lib/api/payment-checkout";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

type Plan = "monthly" | "yearly";

const PLANS: Record<
  Plan,
  { productType: string; subject: string; envAmountKey: string }
> = {
  monthly: {
    productType: "membership_monthly",
    subject: "Artiqore 月度会员",
    envAmountKey: "MEMBERSHIP_MONTHLY_AMOUNT_TOTAL",
  },
  yearly: {
    productType: "membership_yearly",
    subject: "Artiqore 年度会员",
    envAmountKey: "MEMBERSHIP_YEARLY_AMOUNT_TOTAL",
  },
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePlan(value: unknown): Plan {
  const text = cleanText(value).toLowerCase();
  return text === "monthly" ? "monthly" : "yearly";
}

function configuredAmount(plan: Plan) {
  const key = PLANS[plan].envAmountKey;
  const value = Number.parseInt(process.env[key] || "", 10);
  return Number.isInteger(value) && value > 0 ? value : 0;
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

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const plan = normalizePlan(body.plan);
    const config = PLANS[plan];
    const amountTotal = configuredAmount(plan);
    if (!amountTotal) {
      return NextResponse.json(
        { success: false, error: `${config.envAmountKey} 未配置` },
        { status: 503 }
      );
    }

    const supabase = createServiceClient();
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_no: makeOrderNo(),
        subject: config.subject,
        item_type: config.productType,
        product_type: config.productType,
        amount_total: amountTotal,
        currency: "cny",
        status: "pending",
        provider: "internal",
        metadata: {
          plan,
          product_type: config.productType,
        },
      })
      .select("*")
      .single();

    if (error) return errorResponse(error);

    const checkout = await createCheckoutSession(order);
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "checkout_created",
        provider: checkout.provider,
        provider_checkout_session_id: checkout.checkoutSessionId ?? null,
        provider_payment_intent_id: checkout.paymentIntentId ?? null,
        provider_customer_id: checkout.customerId ?? null,
      })
      .eq("id", order.id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (updateError) return errorResponse(updateError);

    return NextResponse.json({
      success: true,
      data: {
        plan,
        productType: config.productType,
        orderId: updatedOrder.id,
        orderNo: updatedOrder.order_no,
        status: updatedOrder.status,
        checkoutUrl: checkout.checkoutUrl,
        order: updatedOrder,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
