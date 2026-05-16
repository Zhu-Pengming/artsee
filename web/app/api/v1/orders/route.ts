import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseIntParam(raw: string | null, defaultValue: number, min: number, max: number) {
  if (raw === null) return { value: defaultValue };
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < min || parsed > max) {
    return { error: `参数必须是 ${min}-${max} 之间的整数` };
  }
  return { value: parsed };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limitCheck = parseIntParam(searchParams.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
    if (limitCheck.error) {
      return NextResponse.json({ success: false, error: `limit ${limitCheck.error}` }, { status: 400 });
    }
    const offsetCheck = parseIntParam(searchParams.get("offset"), 0, 0, 1000000);
    if (offsetCheck.error) {
      return NextResponse.json({ success: false, error: `offset ${offsetCheck.error}` }, { status: 400 });
    }

    const limit = limitCheck.value!;
    const offset = offsetCheck.value!;
    const supabase = createServiceClient();
    const { data, error, count } = await supabase
      .from("orders")
      .select(
        "id, order_no, subject, item_type, item_id, amount_total, currency, status, provider, provider_checkout_session_id, paid_at, canceled_at, created_at",
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      count,
      pagination: { limit, offset },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
