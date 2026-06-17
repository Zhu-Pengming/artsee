import { createHmac } from "crypto";

type Row = Record<string, unknown>;

export type ProviderRefundResult = {
  provider: string;
  providerRefundId?: string | null;
  status: "processing" | "succeeded" | "failed";
  raw?: Row;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function providerEnvKey(provider: string, suffix: string) {
  return `${provider.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_${suffix}`;
}

function refundEndpoint(provider: string) {
  return process.env[providerEnvKey(provider, "REFUND_ENDPOINT")] || process.env.PAYMENT_REFUND_ENDPOINT || "";
}

function refundSecret(provider: string) {
  return process.env[providerEnvKey(provider, "REFUND_SECRET")] || process.env.PAYMENT_REFUND_SECRET || "";
}

function refundSignature(provider: string, rawBody: string) {
  const secret = refundSecret(provider);
  if (!secret) return null;
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

function normalizeProviderStatus(value: unknown): ProviderRefundResult["status"] {
  const status = cleanText(value).toLowerCase();
  if (["succeeded", "success", "paid", "refunded", "completed"].includes(status)) {
    return "succeeded";
  }
  if (["failed", "error", "rejected"].includes(status)) return "failed";
  return "processing";
}

export function hasProviderRefundEndpoint(provider: string) {
  return Boolean(refundEndpoint(provider));
}

export async function createProviderRefund(
  refund: Row,
  order: Row
): Promise<ProviderRefundResult> {
  const provider =
    cleanText(refund.provider) ||
    cleanText(order.provider) ||
    cleanText(process.env.PAYMENT_PROVIDER) ||
    "internal";
  const endpoint = refundEndpoint(provider);
  if (!endpoint || provider === "internal") {
    return { provider: provider || "internal", status: "processing" };
  }

  const payload = {
    provider,
    refund_request_id: cleanText(refund.id),
    order_id: cleanText(order.id),
    order_no: cleanText(order.order_no),
    amount: Number(refund.amount),
    currency: cleanText(refund.currency) || cleanText(order.currency) || "cny",
    reason: cleanText(refund.reason),
    user_id: cleanText(refund.user_id) || cleanText(order.user_id),
    provider_payment_intent_id: cleanText(order.provider_payment_intent_id),
    provider_checkout_session_id: cleanText(order.provider_checkout_session_id),
    metadata: {
      refund: objectValue(refund.metadata),
      order: objectValue(order.metadata),
    },
  };
  const rawBody = JSON.stringify(payload);
  const signature = refundSignature(provider, rawBody);
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
    throw new Error(cleanText(body.error) || `支付 provider 退款发起失败 ${res.status}`);
  }

  return {
    provider,
    providerRefundId:
      cleanText(body.provider_refund_id ?? body.refund_id ?? body.id) || null,
    status: normalizeProviderStatus(body.status),
    raw: body,
  };
}
