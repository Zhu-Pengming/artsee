import { createHmac } from "crypto";

type Row = Record<string, unknown>;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function internalCheckoutUrl(orderId: string) {
  return `/orders/${orderId}`;
}

export function isInternalPaymentAllowed() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_INTERNAL_PAYMENT === "true"
  );
}

function internalPaymentUnavailableMessage() {
  return "生产环境未配置支付渠道，无法创建内部支付订单";
}

function checkoutSignature(rawBody: string) {
  const secret = process.env.PAYMENT_CHECKOUT_SECRET || "";
  if (!secret) return null;
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export type CheckoutSession = {
  provider: string;
  checkoutUrl: string;
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
  customerId?: string | null;
  raw?: Row;
};

export async function createCheckoutSession(order: Row): Promise<CheckoutSession> {
  const provider = cleanText(process.env.PAYMENT_PROVIDER) || cleanText(order.provider) || "internal";
  const endpoint = cleanText(process.env.PAYMENT_CHECKOUT_ENDPOINT);
  const orderId = cleanText(order.id);
  if (!endpoint || provider === "internal") {
    if (!isInternalPaymentAllowed()) {
      throw new Error(internalPaymentUnavailableMessage());
    }
    return {
      provider: "internal",
      checkoutUrl: internalCheckoutUrl(orderId),
    };
  }

  const payload = {
    provider,
    order_id: orderId,
    order_no: cleanText(order.order_no),
    subject: cleanText(order.subject),
    amount_total: Number(order.amount_total),
    currency: cleanText(order.currency) || "cny",
    item_type: cleanText(order.item_type),
    product_type: cleanText(order.product_type) || cleanText(order.item_type),
    item_id: cleanText(order.item_id),
    user_id: cleanText(order.user_id),
    metadata: objectValue(order.metadata),
  };
  const rawBody = JSON.stringify(payload);
  const signature = checkoutSignature(rawBody);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(signature ? { "X-Artiqore-Signature": signature } : {}),
    },
    body: rawBody,
  });
  const body = (await res.json().catch(() => ({}))) as Row;
  if (!res.ok) {
    throw new Error(cleanText(body.error) || `支付 checkout 创建失败 ${res.status}`);
  }

  const checkoutUrl = cleanText(body.checkout_url ?? body.checkoutUrl);
  if (!checkoutUrl) {
    throw new Error("支付 provider 未返回 checkout_url");
  }

  return {
    provider,
    checkoutUrl,
    checkoutSessionId: cleanText(body.checkout_session_id ?? body.checkoutSessionId) || null,
    paymentIntentId: cleanText(body.payment_intent_id ?? body.paymentIntentId) || null,
    customerId: cleanText(body.customer_id ?? body.customerId) || null,
    raw: body,
  };
}
