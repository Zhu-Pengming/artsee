import { NextRequest, NextResponse } from "next/server";
import {
  CONTRACT_STATUSES,
  cleanText,
  isMissingContractsSchema,
  normalizeContract,
  optionalUuid,
  refreshOrganizationContractCount,
} from "@/lib/api/contracts";
import { createNotification } from "@/lib/api/notifications";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";
import { requireWorkbenchUser } from "@/lib/api/workbench-access";

type Ctx = { params: Promise<{ id: string }> };
type Row = Record<string, unknown>;

function statusLabel(status: string) {
  switch (status) {
    case "confirmed":
      return "已确认";
    case "disputed":
      return "有争议";
    case "pending":
      return "待确认";
    default:
      return status;
  }
}

function nullableText(value: unknown) {
  const text = cleanText(value);
  return text || null;
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    const contractId = optionalUuid(id);
    if (!contractId) {
      return NextResponse.json({ success: false, error: "合同 id 无效" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as Row;
    const status = cleanText(body.status);
    if (!status || !CONTRACT_STATUSES.has(status)) {
      return NextResponse.json({ success: false, error: "无效合同状态" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: existing, error: existingError } = await supabase
      .from("contracts")
      .select(
        "*, organization:organizations(id,name,type,status,city,province,metadata,contract_count), consultation:consultations(id,target_type,target_id,target_name,topic,status,created_at)"
      )
      .eq("id", contractId)
      .maybeSingle();

    if (existingError) {
      if (isMissingContractsSchema(existingError)) {
        return NextResponse.json(
          { success: false, error: "合同存档表尚未迁移", schema_ready: false },
          { status: 503 }
        );
      }
      return errorResponse(existingError);
    }
    if (!existing) return notFoundResponse();

    const organizationId = cleanText((existing as Row).organization_id);
    if (!auth.manageableOrganizationIds.includes(organizationId)) {
      return NextResponse.json({ success: false, error: "无权更新该合同" }, { status: 403 });
    }

    const notes = nullableText(body.notes);
    const patch: Row = {
      status,
      ...(notes !== null || "notes" in body ? { notes } : {}),
    };

    const { data, error } = await supabase
      .from("contracts")
      .update(patch)
      .eq("id", contractId)
      .select(
        "*, organization:organizations(id,name,type,status,city,province,metadata,contract_count), consultation:consultations(id,target_type,target_id,target_name,topic,status,created_at)"
      )
      .single();

    if (error) return errorResponse(error);

    await refreshOrganizationContractCount(supabase, organizationId);

    const updated = normalizeContract(data as Row);
    await createNotification(supabase, cleanText((data as Row).user_id), {
      title: "合同存档状态已更新",
      content: `机构已将合同存档标记为「${statusLabel(status)}」。`,
      type: "contract",
      metadata: {
        contract_id: contractId,
        organization_id: organizationId,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      schema_ready: true,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
