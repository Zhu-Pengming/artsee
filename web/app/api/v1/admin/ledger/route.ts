import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const account = cleanText(searchParams.get("account"));
    const entryType = cleanText(searchParams.get("entry_type") ?? searchParams.get("entryType"));
    const sourceType = cleanText(searchParams.get("source_type") ?? searchParams.get("sourceType"));
    const orderId = cleanText(searchParams.get("order_id") ?? searchParams.get("orderId"));
    const mentorId = cleanText(searchParams.get("mentor_id") ?? searchParams.get("mentorId"));

    const supabase = createServiceClient();
    let query = supabase
      .from("financial_ledger_entries")
      .select("*", { count: "exact" })
      .order("occurred_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (account && account !== "all") query = query.eq("account", account);
    if (entryType && entryType !== "all") query = query.eq("entry_type", entryType);
    if (sourceType && sourceType !== "all") query = query.eq("source_type", sourceType);
    if (orderId) query = query.eq("order_id", orderId);
    if (mentorId) query = query.eq("mentor_id", mentorId);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data: data ?? [],
      count: count ?? data?.length ?? 0,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
