import {
  type FinancialLedgerEntry,
  writeFinancialLedgerEntries,
} from "@/lib/api/financial-ledger";
import { createNotification } from "@/lib/api/notifications";
import {
  applyPaidMembershipOrder,
  membershipProductType,
} from "@/lib/api/membership";
import { applyPaidOrganizationSubscriptionOrder } from "@/lib/api/organization-subscription";
import { createServiceClient } from "@/lib/api/supabase-service";

type Supabase = ReturnType<typeof createServiceClient>;
type Row = Record<string, unknown>;

export const PAYABLE_ORDER_STATUSES = new Set(["pending", "checkout_created", "failed"]);
const PLATFORM_FEE_BPS = 1000;
const MANAGED_PRODUCT_AMOUNT_ENVS: Record<string, string> = {
  membership_monthly: "MEMBERSHIP_MONTHLY_AMOUNT_TOTAL",
  membership_yearly: "MEMBERSHIP_YEARLY_AMOUNT_TOTAL",
  org_subscription: "ORG_SUBSCRIPTION_YEARLY_AMOUNT_TOTAL",
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function intValue(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function feeAmount(grossAmount: number) {
  return Math.floor((grossAmount * PLATFORM_FEE_BPS) / 10000);
}

function configuredManagedAmount(productType: string) {
  const envKey = MANAGED_PRODUCT_AMOUNT_ENVS[productType];
  if (!envKey) return { managed: false, amount: null, envKey: null };
  const amount = Number.parseInt(process.env[envKey] || "", 10);
  return {
    managed: true,
    amount: Number.isInteger(amount) && amount > 0 ? amount : null,
    envKey,
  };
}

export function isOrderPayable(status: unknown) {
  return PAYABLE_ORDER_STATUSES.has(cleanText(status) || "pending");
}

async function createMentorEarning(supabase: Supabase, order: Row) {
  if (order.item_type !== "mentor_booking") return null;
  const bookingId = cleanText(order.item_id);
  if (!bookingId) return null;

  const { data: booking, error: bookingError } = await supabase
    .from("mentor_bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();
  if (bookingError || !booking) return { error: bookingError ?? new Error("booking not found") };

  const { data: existing, error: existingError } = await supabase
    .from("mentor_earnings")
    .select("*")
    .eq("order_id", order.id)
    .maybeSingle();
  if (existingError) return { error: existingError };
  if (existing) return { booking, earning: existing };

  const gross = intValue(order.amount_total);
  const platformFee = feeAmount(gross);
  const { data: earning, error: earningError } = await supabase
    .from("mentor_earnings")
    .insert({
      mentor_id: booking.mentor_id,
      mentor_booking_id: booking.id,
      order_id: order.id,
      gross_amount: gross,
      platform_fee_amount: platformFee,
      net_amount: Math.max(0, gross - platformFee),
      currency: cleanText(order.currency) || "cny",
      status: booking.status === "completed" ? "available" : "pending",
      available_at:
        booking.status === "completed" ? new Date().toISOString() : null,
      metadata: {
        platform_fee_bps: PLATFORM_FEE_BPS,
      },
    })
    .select("*")
    .single();

  if (earningError) return { error: earningError };
  return { booking, earning };
}

export async function markOrderPaid(
  supabase: Supabase,
  existing: Row,
  options: {
    provider?: string | null;
    providerCheckoutSessionId?: string | null;
    providerPaymentIntentId?: string | null;
    providerCustomerId?: string | null;
    paidAt?: string | null;
    metadata?: Row | null;
  } = {}
) {
  if (cleanText(existing.status) === "paid") {
    return { order: existing, mentor: null };
  }
  if (!isOrderPayable(existing.status)) {
    return { error: new Error("该订单当前状态不可确认支付") };
  }

  const existingProductType = membershipProductType(existing);
  const managedAmount = configuredManagedAmount(existingProductType);
  if (managedAmount.managed) {
    if (!managedAmount.amount) {
      return { error: new Error(`${managedAmount.envKey} 未配置`) };
    }
    if (intValue(existing.amount_total) !== managedAmount.amount) {
      return { error: new Error("受管商品订单金额与平台配置不一致") };
    }
  }

  const paidAt = options.paidAt || new Date().toISOString();
  const { data: order, error: updateError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: paidAt,
      provider: options.provider || cleanText(existing.provider) || "internal",
      provider_checkout_session_id:
        options.providerCheckoutSessionId ??
        existing.provider_checkout_session_id ??
        null,
      provider_payment_intent_id:
        options.providerPaymentIntentId ?? existing.provider_payment_intent_id ?? null,
      provider_customer_id:
        options.providerCustomerId ?? existing.provider_customer_id ?? null,
      metadata: {
        ...objectValue(existing.metadata),
        ...(options.metadata ?? {}),
      },
    })
    .eq("id", existing.id)
    .select("*")
    .single();
  if (updateError) return { error: updateError };

  let mentorPayload: Awaited<ReturnType<typeof createMentorEarning>> = null;
  if (order.item_type === "mentor_booking") {
    const { data: booking, error: bookingUpdateError } = await supabase
      .from("mentor_bookings")
      .update({ payment_status: "paid" })
      .eq("id", order.item_id)
      .select("*")
      .single();
    if (bookingUpdateError) return { error: bookingUpdateError };
    mentorPayload = await createMentorEarning(supabase, order);
    if (mentorPayload?.error) return { error: mentorPayload.error };

    const { data: mentor } = await supabase
      .from("mentors")
      .select("user_id")
      .eq("id", booking.mentor_id)
      .maybeSingle();
    await createNotification(supabase, cleanText(mentor?.user_id), {
      title: "导师预约已支付",
      content: cleanText(order.subject) || null,
      type: "mentor_payment",
      metadata: {
        order_id: order.id,
        mentor_booking_id: booking.id,
        mentor_id: booking.mentor_id,
      },
    });
  }

  const membership = await applyPaidMembershipOrder(supabase, order, paidAt);
  if (membership.error) return { error: membership.error };
  const organizationSubscription =
    await applyPaidOrganizationSubscriptionOrder(supabase, order, paidAt);
  if (organizationSubscription.error) {
    return { error: organizationSubscription.error };
  }

  const gross = intValue(order.amount_total);
  const currency = cleanText(order.currency) || "cny";
  const productType = membershipProductType(order);
  const ledgerEntries: FinancialLedgerEntry[] = [
    {
      entryType: "order_payment_gross",
      account: "cash",
      sourceType: "order",
      sourceId: cleanText(order.id),
      orderId: cleanText(order.id),
      userId: cleanText(order.user_id),
      amount: gross,
      currency,
      occurredAt: paidAt,
      metadata: {
        provider: cleanText(order.provider),
        item_type: cleanText(order.item_type),
        product_type: productType || null,
      },
    },
  ];
  if (mentorPayload?.earning) {
    const earning = mentorPayload.earning;
    ledgerEntries.push(
      {
        entryType: "platform_fee_accrual",
        account: "platform_fee_revenue",
        sourceType: "order",
        sourceId: cleanText(order.id),
        orderId: cleanText(order.id),
        mentorId: cleanText(earning.mentor_id),
        amount: intValue(earning.platform_fee_amount),
        currency,
        occurredAt: paidAt,
        metadata: {
          mentor_earning_id: cleanText(earning.id),
        },
      },
      {
        entryType: "mentor_earning_accrual",
        account: "mentor_payable",
        sourceType: "order",
        sourceId: cleanText(order.id),
        orderId: cleanText(order.id),
        mentorId: cleanText(earning.mentor_id),
        amount: intValue(earning.net_amount),
        currency,
        occurredAt: paidAt,
        metadata: {
          mentor_earning_id: cleanText(earning.id),
        },
      }
    );
  }
  await writeFinancialLedgerEntries(supabase, ledgerEntries);

  return {
    order,
    mentor: mentorPayload?.earning ? { earning: mentorPayload.earning } : null,
    membership: membership.data,
    organizationSubscription: organizationSubscription.data,
  };
}

export async function markOrderFailed(
  supabase: Supabase,
  existing: Row,
  message: string | null,
  metadata: Row = {}
) {
  return supabase
    .from("orders")
    .update({
      status: "failed",
      metadata: {
        ...objectValue(existing.metadata),
        ...metadata,
        last_payment_error: message,
      },
    })
    .eq("id", existing.id)
    .select("*")
    .single();
}

export async function markOrderRefunded(
  supabase: Supabase,
  existing: Row,
  metadata: Row = {}
) {
  const refundedAt = new Date().toISOString();
  const { data: order, error } = await supabase
    .from("orders")
    .update({
      status: "refunded",
      refunded_at: refundedAt,
      metadata: {
        ...objectValue(existing.metadata),
        ...metadata,
      },
    })
    .eq("id", existing.id)
    .select("*")
    .single();
  if (error) return { data: null, error };

  if (order.item_type === "mentor_booking") {
    await supabase
      .from("mentor_bookings")
      .update({ payment_status: "refunded" })
      .eq("id", order.item_id);
    await supabase
      .from("mentor_earnings")
      .update({ status: "refunded" })
      .eq("order_id", order.id);
  }
  const gross = intValue(order.amount_total);
  const currency = cleanText(order.currency) || "cny";
  const entries: FinancialLedgerEntry[] = [
    {
      entryType: "order_refund_gross",
      account: "refunds",
      sourceType: "order_refund",
      sourceId: cleanText(order.id),
      orderId: cleanText(order.id),
      userId: cleanText(order.user_id),
      amount: gross,
      currency,
      occurredAt: refundedAt,
      metadata,
    },
  ];
  if (order.item_type === "mentor_booking") {
    const platformFee = feeAmount(gross);
    entries.push({
      entryType: "mentor_earning_reversal",
      account: "mentor_payable",
      sourceType: "order_refund",
      sourceId: cleanText(order.id),
      orderId: cleanText(order.id),
      amount: Math.max(0, gross - platformFee),
      currency,
      occurredAt: refundedAt,
      metadata,
    });
  }
  await writeFinancialLedgerEntries(supabase, entries);
  return { data: order, error: null };
}
