import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/api/payment-checkout";
import {
  errorResponse,
  invalidIdResponse,
  notFoundResponse,
} from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";
import { isAuthzResponse, requireOrgMember } from "@/lib/api/authz";

type Ctx = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRODUCT_TYPE = "org_subscription";
const AMOUNT_ENV = "ORG_SUBSCRIPTION_YEARLY_AMOUNT_TOTAL";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function configuredAmount() {
  const value = Number.parseInt(process.env[AMOUNT_ENV] || "", 10);
  return Number.isInteger(value) && value > 0 ? value : 0;
}

function makeOrderNo() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AQ${stamp}${rand}`;
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const auth = await requireOrgMember(req, id, ["owner", "admin"]);
    if (isAuthzResponse(auth)) return auth.response;

    const amountTotal = configuredAmount();
    if (!amountTotal) {
      return NextResponse.json(
        { success: false, error: `${AMOUNT_ENV} 未配置` },
        { status: 503 }
      );
    }

    const supabase = createServiceClient();
    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .select("id,name,status,subscription_status,subscription_expires_at")
      .eq("id", id)
      .maybeSingle();
    if (organizationError) return errorResponse(organizationError);
    if (!organization) return notFoundResponse();

    const name = cleanText(organization.name) || "机构";
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: auth.user.id,
        order_no: makeOrderNo(),
        subject: `${name} 年度入驻服务`,
        item_type: PRODUCT_TYPE,
        product_type: PRODUCT_TYPE,
        item_id: id,
        amount_total: amountTotal,
        currency: "cny",
        status: "pending",
        provider: "internal",
        metadata: {
          organization_id: id,
          organization_name: name,
          plan: "yearly",
          product_type: PRODUCT_TYPE,
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
      .eq("user_id", auth.user.id)
      .select("*")
      .single();
    if (updateError) return errorResponse(updateError);

    return NextResponse.json({
      success: true,
      data: {
        plan: "yearly",
        productType: PRODUCT_TYPE,
        organizationId: id,
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
