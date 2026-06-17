import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

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
    const includeItems = searchParams.get("include_items") === "true";
    const limit = intParam(searchParams.get("limit"), 40, 100);
    const offset = intParam(searchParams.get("offset"), 0, 5000);

    if (kind && !KINDS.has(kind)) {
      return NextResponse.json({ success: false, error: "kind 参数无效" }, { status: 400 });
    }

    const supabase = createServiceClient();
    let query = supabase
      .from("payment_reconciliation_runs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (provider) query = query.eq("provider", provider);
    if (kind) query = query.eq("kind", kind);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);

    let itemsByRun: Record<string, unknown[]> = {};
    if (includeItems && data?.length) {
      const runIds = data.map((run) => run.id).filter((id): id is string => typeof id === "string");
      const { data: items, error: itemsError } = await supabase
        .from("payment_reconciliation_items")
        .select("*")
        .in("run_id", runIds)
        .order("created_at", { ascending: true });
      if (itemsError) return errorResponse(itemsError);
      itemsByRun = (items ?? []).reduce<Record<string, unknown[]>>((acc, item) => {
        const runId = cleanText(item.run_id);
        if (!runId) return acc;
        acc[runId] = [...(acc[runId] ?? []), item];
        return acc;
      }, {});
    }

    return NextResponse.json({
      success: true,
      data: (data ?? []).map((run) => ({
        ...run,
        items: includeItems ? itemsByRun[run.id] ?? [] : undefined,
      })),
      count: count ?? data?.length ?? 0,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
