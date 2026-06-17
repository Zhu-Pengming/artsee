import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/api/admin-audit";
import { requireAdmin } from "@/lib/api/require-admin";
import {
  errorResponse,
  invalidIdResponse,
  notFoundResponse,
} from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
type Row = Record<string, unknown>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RESOLUTION_STATUSES = new Set(["resolved", "ignored"]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const body = (await req.json().catch(() => ({}))) as Row;
    const resolutionStatus = cleanText(
      body.resolution_status ?? body.resolutionStatus ?? body.status
    );
    const resolutionNote = cleanText(body.resolution_note ?? body.resolutionNote);
    if (!RESOLUTION_STATUSES.has(resolutionStatus)) {
      return NextResponse.json(
        { success: false, error: "resolution_status 必须是 resolved 或 ignored" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: item, error: itemError } = await supabase
      .from("payment_reconciliation_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (itemError) return errorResponse(itemError);
    if (!item) return notFoundResponse();

    const itemStatus = cleanText(item.status);
    const currentResolutionStatus = cleanText(item.resolution_status) || "open";
    if (!["unmatched", "mismatch"].includes(itemStatus)) {
      return NextResponse.json(
        { success: false, error: "只有未匹配或金额不一致的对账项需要人工处理" },
        { status: 400 }
      );
    }
    if (currentResolutionStatus !== "open") {
      return NextResponse.json(
        { success: false, error: "该对账差异已处理，不能重复标记" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("payment_reconciliation_items")
      .update({
        resolution_status: resolutionStatus,
        resolution_note: resolutionNote || null,
        resolved_by_user_id: admin.user.id,
        resolved_at: now,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return errorResponse(error);

    await writeAdminAuditLog(supabase, req, {
      actorUserId: admin.user.id,
      action: "reconciliation_item.resolve",
      targetType: "payment_reconciliation_item",
      targetId: id,
      targetLabel: `${item.provider}:${item.external_id ?? id}`,
      metadata: {
        previous_resolution_status: currentResolutionStatus,
        final_resolution_status: resolutionStatus,
        item_status: itemStatus,
        provider: item.provider,
        kind: item.kind,
        run_id: item.run_id,
        external_id: item.external_id,
        matched_entity_type: item.matched_entity_type,
        matched_entity_id: item.matched_entity_id,
        amount: item.amount,
        expected_amount: item.expected_amount,
        resolution_note: resolutionNote || null,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
