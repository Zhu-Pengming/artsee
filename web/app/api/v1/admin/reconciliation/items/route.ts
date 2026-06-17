import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

const ITEM_STATUSES = new Set(["matched", "unmatched", "mismatch", "auto_applied"]);
const RESOLUTION_STATUSES = new Set(["open", "resolved", "ignored"]);
const KINDS = new Set(["orders", "refunds", "payouts"]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function intParam(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, max);
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { searchParams } = new URL(req.url);
    const provider = cleanText(searchParams.get("provider"));
    const kind = cleanText(searchParams.get("kind"));
    const status = cleanText(searchParams.get("status"));
    const resolutionStatus = cleanText(searchParams.get("resolution_status")) || "open";
    const runId = cleanText(searchParams.get("run_id"));
    const limit = intParam(searchParams.get("limit"), 40, 100);
    const offset = intParam(searchParams.get("offset"), 0, 5000);

    if (kind && !KINDS.has(kind)) {
      return NextResponse.json({ success: false, error: "kind 参数无效" }, { status: 400 });
    }
    if (status && status !== "all" && !ITEM_STATUSES.has(status)) {
      return NextResponse.json({ success: false, error: "status 参数无效" }, { status: 400 });
    }
    if (resolutionStatus && resolutionStatus !== "all" && !RESOLUTION_STATUSES.has(resolutionStatus)) {
      return NextResponse.json(
        { success: false, error: "resolution_status 参数无效" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    let query = supabase
      .from("payment_reconciliation_items")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (provider) query = query.eq("provider", provider);
    if (kind) query = query.eq("kind", kind);
    if (runId) query = query.eq("run_id", runId);
    if (resolutionStatus !== "all") query = query.eq("resolution_status", resolutionStatus);
    if (status === "all") {
      if (resolutionStatus === "open") query = query.in("status", ["unmatched", "mismatch"]);
    } else if (status) {
      query = query.eq("status", status);
    } else if (resolutionStatus === "open") {
      query = query.in("status", ["unmatched", "mismatch"]);
    }

    const { data, count, error } = await query;
    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data: data ?? [],
      count: count ?? data?.length ?? 0,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
