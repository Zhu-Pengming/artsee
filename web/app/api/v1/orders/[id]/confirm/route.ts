import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { isOrderPayable, markOrderPaid } from "@/lib/api/order-payments";
import { isInternalPaymentAllowed } from "@/lib/api/payment-checkout";
import {
  errorResponse,
  invalidIdResponse,
  notFoundResponse,
} from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

    if (existingError) return errorResponse(existingError);
    if (!existing) return notFoundResponse();

    const status = cleanText(existing.status) || "pending";
    if (status === "paid") {
      return NextResponse.json({ success: true, data: existing });
    }
    if ((cleanText(existing.provider) || "internal") !== "internal") {
      return NextResponse.json(
        { success: false, error: "外部支付订单需等待支付回调确认" },
        { status: 400 }
      );
    }
    if (!isInternalPaymentAllowed()) {
      return NextResponse.json(
        { success: false, error: "生产环境不允许手动确认内部支付订单" },
        { status: 403 }
      );
    }
    if (!isOrderPayable(status)) {
      return NextResponse.json(
        { success: false, error: "该订单当前状态不可确认支付" },
        { status: 400 }
      );
    }

    const paid = await markOrderPaid(supabase, existing, {
      provider: cleanText(existing.provider) || "internal",
    });
    if (paid.error) return errorResponse(paid.error);

    return NextResponse.json({
      success: true,
      data: paid.order,
      mentor: paid.mentor,
      membership: paid.membership,
      organization_subscription: paid.organizationSubscription,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
