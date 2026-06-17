import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("response" in admin) return admin.response;

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status")?.trim();
    const orderId = searchParams.get("order_id")?.trim();
    const userId = searchParams.get("user_id")?.trim();

    const supabase = createServiceClient();
    let query = supabase
      .from("payment_refund_requests")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (status && status !== "all") query = query.eq("status", status);
    if (orderId) query = query.eq("order_id", orderId);
    if (userId) query = query.eq("user_id", userId);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);
    return NextResponse.json({
      success: true,
      data: data ?? [],
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
