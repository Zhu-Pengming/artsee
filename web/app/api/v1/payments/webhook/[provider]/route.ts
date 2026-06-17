import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  markOrderFailed,
  markOrderPaid,
  markOrderRefunded,
} from "@/lib/api/order-payments";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ provider: string }> };
type Row = Record<string, unknown>;

const PAID_EVENTS = new Set([
  "checkout.session.completed",
  "payment.succeeded",
  "order.paid",
]);
const FAILED_EVENTS = new Set(["payment.failed", "order.failed"]);
const REFUNDED_EVENTS = new Set(["charge.refunded", "payment.refunded", "order.refunded"]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function normalizeProvider(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

function providerSecret(provider: string) {
  const envKey = `${provider.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_WEBHOOK_SECRET`;
  return process.env[envKey] || process.env.PAYMENT_WEBHOOK_SECRET || "";
}

function signatureValue(req: NextRequest) {
  return (
    req.headers.get("x-artiqore-signature") ||
    req.headers.get("x-signature") ||
    ""
  ).replace(/^sha256=/, "");
}

function verifySignature(rawBody: string, signature: string, secret: string) {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const left = Buffer.from(signature, "hex");
  const right = Buffer.from(expected, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

function eventObject(payload: Row) {
  const data = objectValue(payload.data);
  const nested = objectValue(data.object);
  if (Object.keys(nested).length > 0) return nested;
  if (Object.keys(data).length > 0) return data;
  return payload;
}

function eventId(payload: Row, object: Row) {
  return (
    cleanText(payload.event_id) ||
    cleanText(payload.id) ||
    cleanText(object.event_id) ||
    cleanText(object.id)
  );
}

function eventType(payload: Row) {
  return cleanText(payload.event_type) || cleanText(payload.type);
}

function providerPaymentIntentId(object: Row) {
  return (
    cleanText(object.provider_payment_intent_id) ||
    cleanText(object.payment_intent) ||
    cleanText(object.payment_intent_id) ||
    cleanText(object.transaction_id)
  );
}

function providerCheckoutSessionId(object: Row) {
  return (
    cleanText(object.provider_checkout_session_id) ||
    cleanText(object.checkout_session_id) ||
    cleanText(object.session_id)
  );
}

function providerCustomerId(object: Row) {
  return cleanText(object.provider_customer_id) || cleanText(object.customer_id);
}

function paidAt(object: Row) {
  const raw = object.paid_at ?? object.created_at ?? object.created;
  if (typeof raw === "number") return new Date(raw * 1000).toISOString();
  const text = cleanText(raw);
  if (!text) return null;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function amountValue(object: Row) {
  const value = object.amount_total ?? object.amount_paid ?? object.amount;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function findOrder(
  supabase: ReturnType<typeof createServiceClient>,
  object: Row
) {
  const metadata = objectValue(object.metadata);
  const orderId = cleanText(object.order_id) || cleanText(metadata.order_id);
  const orderNo = cleanText(object.order_no) || cleanText(metadata.order_no);
  const paymentIntentId = providerPaymentIntentId(object);
  const checkoutSessionId = providerCheckoutSessionId(object);

  const filters = [
    ["id", orderId],
    ["order_no", orderNo],
    ["provider_payment_intent_id", paymentIntentId],
    ["provider_checkout_session_id", checkoutSessionId],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  for (const [field, value] of filters) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq(field, value)
      .maybeSingle();
    if (error) return { error };
    if (data) return { order: data as Row };
  }
  return { order: null };
}

async function updateEvent(
  supabase: ReturnType<typeof createServiceClient>,
  eventRow: Row,
  patch: Row
) {
  return supabase
    .from("payment_events")
    .update(patch)
    .eq("id", eventRow.id)
    .select("*")
    .single();
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { provider: rawProvider } = await ctx.params;
  const provider = normalizeProvider(rawProvider);
  if (!provider) {
    return NextResponse.json({ success: false, error: "无效支付 provider" }, { status: 400 });
  }

  const rawBody = await req.text();
  const secret = providerSecret(provider);
  if (!secret) {
    return NextResponse.json({ success: false, error: "支付 webhook 密钥未配置" }, { status: 503 });
  }
  if (!verifySignature(rawBody, signatureValue(req), secret)) {
    return NextResponse.json({ success: false, error: "支付 webhook 签名无效" }, { status: 401 });
  }

  let payload: Row;
  try {
    payload = JSON.parse(rawBody) as Row;
  } catch {
    return NextResponse.json({ success: false, error: "无效 JSON payload" }, { status: 400 });
  }

  const object = eventObject(payload);
  const type = eventType(payload);
  const id = eventId(payload, object);
  if (!id || !type) {
    return NextResponse.json({ success: false, error: "缺少支付事件 ID 或类型" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: existingEvent, error: existingEventError } = await supabase
    .from("payment_events")
    .select("*")
    .eq("provider", provider)
    .eq("event_id", id)
    .maybeSingle();
  if (existingEventError) return errorResponse(existingEventError);
  if (existingEvent) {
    return NextResponse.json({
      success: true,
      duplicate: true,
      data: existingEvent,
    });
  }

  const { data: eventRow, error: eventInsertError } = await supabase
    .from("payment_events")
    .insert({
      provider,
      event_id: id,
      event_type: type,
      payload,
      status: "pending",
    })
    .select("*")
    .single();
  if (eventInsertError) return errorResponse(eventInsertError);

  const found = await findOrder(supabase, object);
  if (found.error) {
    await updateEvent(supabase, eventRow, {
      status: "failed",
      error_message: cleanText(found.error.message) || "order lookup failed",
      processed_at: new Date().toISOString(),
    });
    return errorResponse(found.error);
  }
  if (!found.order) {
    await updateEvent(supabase, eventRow, {
      status: "failed",
      error_message: "order not found",
      processed_at: new Date().toISOString(),
    });
    return notFoundResponse();
  }

  const eventMetadata = {
    payment_event_id: eventRow.id,
    payment_provider_event_id: id,
    payment_provider_event_type: type,
  };
  const amount = amountValue(object);
  if (amount != null && amount !== Number(found.order.amount_total)) {
    await updateEvent(supabase, eventRow, {
      order_id: found.order.id,
      status: "failed",
      error_message: "amount mismatch",
      processed_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: false, error: "支付金额与订单不一致" }, { status: 400 });
  }

  if (PAID_EVENTS.has(type)) {
    const paid = await markOrderPaid(supabase, found.order, {
      provider,
      providerCheckoutSessionId: providerCheckoutSessionId(object),
      providerPaymentIntentId: providerPaymentIntentId(object),
      providerCustomerId: providerCustomerId(object),
      paidAt: paidAt(object),
      metadata: eventMetadata,
    });
    if (paid.error) {
      await updateEvent(supabase, eventRow, {
        order_id: found.order.id,
        status: "failed",
        error_message: cleanText(paid.error.message) || "payment processing failed",
        processed_at: new Date().toISOString(),
      });
      return errorResponse(paid.error);
    }
    const { data: processedEvent } = await updateEvent(supabase, eventRow, {
      order_id: paid.order.id,
      status: "processed",
      processed_at: new Date().toISOString(),
    });
    return NextResponse.json({
      success: true,
      data: {
        order: paid.order,
        event: processedEvent,
        mentor: paid.mentor,
        membership: paid.membership,
        organization_subscription: paid.organizationSubscription,
      },
    });
  }

  if (FAILED_EVENTS.has(type)) {
    const failed = await markOrderFailed(
      supabase,
      found.order,
      cleanText(object.failure_message) || cleanText(object.error_message) || null,
      eventMetadata
    );
    if (failed.error) return errorResponse(failed.error);
    const { data: processedEvent } = await updateEvent(supabase, eventRow, {
      order_id: failed.data?.id ?? found.order.id,
      status: "processed",
      processed_at: new Date().toISOString(),
    });
    return NextResponse.json({
      success: true,
      data: { order: failed.data, event: processedEvent },
    });
  }

  if (REFUNDED_EVENTS.has(type)) {
    const refunded = await markOrderRefunded(supabase, found.order, eventMetadata);
    if (refunded.error) return errorResponse(refunded.error);
    const { data: processedEvent } = await updateEvent(supabase, eventRow, {
      order_id: refunded.data?.id ?? found.order.id,
      status: "processed",
      processed_at: new Date().toISOString(),
    });
    return NextResponse.json({
      success: true,
      data: { order: refunded.data, event: processedEvent },
    });
  }

  const { data: ignoredEvent } = await updateEvent(supabase, eventRow, {
    order_id: found.order.id,
    status: "ignored",
    processed_at: new Date().toISOString(),
  });
  return NextResponse.json({
    success: true,
    ignored: true,
    data: { event: ignoredEvent },
  });
}
