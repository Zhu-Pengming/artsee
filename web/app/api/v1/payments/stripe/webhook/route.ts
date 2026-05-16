import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";

const STRIPE_API_VERSION = "2026-04-22.dahlia";

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

async function updateOrderForSession(session: Stripe.Checkout.Session, status: string) {
  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId) return;

  const supabase = createServiceClient();
  const patch: Record<string, unknown> = {
    status,
    provider_checkout_session_id: session.id,
    provider_payment_intent_id:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    provider_customer_id: typeof session.customer === "string" ? session.customer : null,
  };

  if (status === "paid") patch.paid_at = new Date().toISOString();
  if (status === "canceled" || status === "expired") patch.canceled_at = new Date().toISOString();

  await supabase.from("orders").update(patch).eq("id", orderId);
}

export async function POST(req: NextRequest) {
  const stripe = stripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ success: false, error: "未配置 Stripe Webhook" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ success: false, error: "缺少 stripe-signature" }, { status: 400 });
  }

  try {
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      await updateOrderForSession(event.data.object as Stripe.Checkout.Session, "paid");
    } else if (event.type === "checkout.session.expired") {
      await updateOrderForSession(event.data.object as Stripe.Checkout.Session, "expired");
    } else if (event.type === "checkout.session.async_payment_failed") {
      await updateOrderForSession(event.data.object as Stripe.Checkout.Session, "failed");
    }

    return NextResponse.json({ received: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
