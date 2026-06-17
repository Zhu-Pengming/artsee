import { createHmac } from "crypto";

type Row = Record<string, unknown>;

export type ProviderPayoutBatchResult = {
  provider: string;
  providerBatchId?: string | null;
  status: "processing" | "paid" | "failed" | "canceled";
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

function payoutEndpoint(provider: string) {
  return process.env[providerEnvKey(provider, "PAYOUT_ENDPOINT")] || process.env.PAYMENT_PAYOUT_ENDPOINT || "";
}

function payoutSecret(provider: string) {
  return process.env[providerEnvKey(provider, "PAYOUT_SECRET")] || process.env.PAYMENT_PAYOUT_SECRET || "";
}

function payoutSignature(provider: string, rawBody: string) {
  const secret = payoutSecret(provider);
  if (!secret) return null;
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

function normalizeProviderStatus(value: unknown): ProviderPayoutBatchResult["status"] {
  const status = cleanText(value).toLowerCase();
  if (["paid", "succeeded", "success", "completed"].includes(status)) return "paid";
  if (["failed", "error", "rejected"].includes(status)) return "failed";
  if (["canceled", "cancelled"].includes(status)) return "canceled";
  return "processing";
}

function itemPayload(item: Row) {
  return {
    payout_batch_item_id: cleanText(item.id),
    withdrawal_request_id: cleanText(item.withdrawal_request_id),
    mentor_id: cleanText(item.mentor_id),
    amount: Number(item.amount),
    currency: cleanText(item.currency) || "cny",
    metadata: objectValue(item.metadata),
  };
}

export async function createProviderPayoutBatch(
  batch: Row,
  items: Row[]
): Promise<ProviderPayoutBatchResult> {
  const provider =
    cleanText(batch.provider) ||
    cleanText(process.env.PAYMENT_PAYOUT_PROVIDER) ||
    cleanText(process.env.PAYMENT_PROVIDER) ||
    "internal";
  const endpoint = payoutEndpoint(provider);
  if (!endpoint || provider === "internal") {
    return { provider: provider || "internal", status: "processing" };
  }

  const payload = {
    provider,
    payout_batch_id: cleanText(batch.id),
    batch_no: cleanText(batch.batch_no),
    total_amount: Number(batch.total_amount),
    currency: cleanText(batch.currency) || "cny",
    item_count: Number(batch.item_count),
    notes: cleanText(batch.notes),
    metadata: objectValue(batch.metadata),
    items: items.map(itemPayload),
  };
  const rawBody = JSON.stringify(payload);
  const signature = payoutSignature(provider, rawBody);
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
    throw new Error(cleanText(body.error) || `支付 provider 打款批次发起失败 ${res.status}`);
  }

  return {
    provider,
    providerBatchId:
      cleanText(body.provider_batch_id ?? body.batch_id ?? body.id) || null,
    status: normalizeProviderStatus(body.status),
    raw: body,
  };
}
