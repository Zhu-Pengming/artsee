import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createCheckoutSession } from "@/lib/api/payment-checkout";
import { createServiceClient } from "@/lib/api/supabase-service";
import {
  errorResponse,
  invalidIdResponse,
  notFoundResponse,
} from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHECKOUTABLE_STATUSES = new Set([
  "pending",
  "checkout_created",
  "failed",
  "expired",
]);

function isMissingOrdersTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes("orders"))
  );
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "未授权" },
        { status: 401 }
      );
    }

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const supabase = createServiceClient();
    const { data: existing, error: existingError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      if (isMissingOrdersTable(existingError)) return notFoundResponse();
      return errorResponse(existingError);
    }
    if (!existing) return notFoundResponse();

    const currentStatus = existing.status?.toString() ?? "pending";
    if (!CHECKOUTABLE_STATUSES.has(currentStatus)) {
      return NextResponse.json(
        { success: false, error: "该订单当前状态不可支付" },
        { status: 400 }
      );
    }

    const checkout = await createCheckoutSession(existing);

    const { data: order, error } = await supabase
      .from("orders")
      .update({
        status: "checkout_created",
        provider: checkout.provider,
        provider_checkout_session_id:
          checkout.checkoutSessionId ?? existing.provider_checkout_session_id ?? null,
        provider_payment_intent_id:
          checkout.paymentIntentId ?? existing.provider_payment_intent_id ?? null,
        provider_customer_id:
          checkout.customerId ?? existing.provider_customer_id ?? null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNo: order.order_no,
        status: order.status,
        checkoutUrl: checkout.checkoutUrl,
        order,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
