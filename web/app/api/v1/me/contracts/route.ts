import { NextRequest, NextResponse } from "next/server";
import { requireUser, isAuthzResponse } from "@/lib/api/authz";
import {
  CONTRACT_STATUSES,
  cleanText,
  isMissingContractsSchema,
  normalizeContract,
  objectValue,
  optionalUuid,
  refreshOrganizationContractCount,
} from "@/lib/api/contracts";
import { errorResponse, notFoundResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";
import {
  createNotifications,
  getOrganizationManagerUserIds,
} from "@/lib/api/notifications";

type Row = Record<string, unknown>;

function nullableText(value: unknown) {
  const text = cleanText(value);
  return text || null;
}

function nullableIsoDate(value: unknown) {
  const text = cleanText(value);
  if (!text) return { value: null, error: null };
  const timestamp = Date.parse(text);
  if (!Number.isFinite(timestamp)) {
    return { value: null, error: "签约时间格式无效" };
  }
  return { value: new Date(timestamp).toISOString(), error: null };
}

function sameOrganization(consultation: Row | null, organizationId: string) {
  if (!consultation) return false;
  if (cleanText(consultation.assigned_to_org_id) === organizationId) return true;
  return cleanText(objectValue(consultation.metadata).organization_id) === organizationId;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (isAuthzResponse(auth)) return auth.response;

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const status = cleanText(searchParams.get("status"));
    const organizationId = cleanText(searchParams.get("organization_id"));

    if (status && !CONTRACT_STATUSES.has(status)) {
      return NextResponse.json({ success: false, error: "无效合同状态" }, { status: 400 });
    }

    const supabase = createServiceClient();
    let query = supabase
      .from("contracts")
      .select(
        "*, organization:organizations(id,name,type,status,city,province,metadata,contract_count), consultation:consultations(id,target_type,target_id,target_name,topic,status,created_at)",
        { count: "exact" }
      )
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (organizationId) query = query.eq("organization_id", organizationId);

    const { data, error, count } = await query;
    if (error) {
      if (isMissingContractsSchema(error)) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          pagination: { limit, offset },
          schema_ready: false,
        });
      }
      return errorResponse(error);
    }

    return NextResponse.json({
      success: true,
      data: ((data ?? []) as Row[]).map((row) => normalizeContract(row)),
      count,
      pagination: { limit, offset },
      schema_ready: true,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (isAuthzResponse(auth)) return auth.response;

    const body = (await req.json().catch(() => ({}))) as Row;
    const requestedOrganizationId = cleanText(body.organization_id);
    const requestedConsultationId = cleanText(body.consultation_id);
    const organizationId = optionalUuid(body.organization_id);
    const consultationId = optionalUuid(body.consultation_id);
    const requestedStatus = cleanText(body.status);
    const status = "pending";
    const signedAt = nullableIsoDate(body.signed_at);

    if (!requestedOrganizationId) {
      return NextResponse.json({ success: false, error: "organization_id 必填" }, { status: 400 });
    }
    if (!organizationId) {
      return NextResponse.json({ success: false, error: "organization_id 无效" }, { status: 400 });
    }
    if (requestedConsultationId && !consultationId) {
      return NextResponse.json({ success: false, error: "consultation_id 无效" }, { status: 400 });
    }
    if (requestedStatus && requestedStatus !== "pending") {
      return NextResponse.json(
        { success: false, error: "用户上传合同只能创建待确认存档" },
        { status: 400 }
      );
    }
    if (signedAt.error) {
      return NextResponse.json({ success: false, error: signedAt.error }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .select("id,name,status")
      .eq("id", organizationId)
      .maybeSingle();
    if (organizationError) return errorResponse(organizationError);
    if (!organization || organization.status !== "active") return notFoundResponse();

    if (consultationId) {
      const { data: consultation, error: consultationError } = await supabase
        .from("consultations")
        .select("id,user_id,assigned_to_org_id,metadata")
        .eq("id", consultationId)
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (consultationError) return errorResponse(consultationError);
      if (!sameOrganization((consultation as Row | null) ?? null, organizationId)) {
        return NextResponse.json(
          { success: false, error: "咨询不属于该机构" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("contracts")
      .insert({
        user_id: auth.user.id,
        organization_id: organizationId,
        consultation_id: consultationId || null,
        file_url: nullableText(body.file_url),
        signed_at: signedAt.value,
        status,
        notes: nullableText(body.notes),
      })
      .select(
        "*, organization:organizations(id,name,type,status,city,province,metadata,contract_count), consultation:consultations(id,target_type,target_id,target_name,topic,status,created_at)"
      )
      .single();

    if (error) {
      if (isMissingContractsSchema(error)) {
        return NextResponse.json(
          { success: false, error: "合同存档表尚未迁移", schema_ready: false },
          { status: 503 }
        );
      }
      return errorResponse(error);
    }

    await refreshOrganizationContractCount(supabase, organizationId);
    const managerUserIds = await getOrganizationManagerUserIds(supabase, organizationId);
    await createNotifications(supabase, managerUserIds, {
      title: "有新的合同存档待确认",
      content: `${organization.name ?? "机构"}收到学生上传的合同存档。`,
      type: "contract",
      metadata: {
        contract_id: (data as Row).id,
        organization_id: organizationId,
        consultation_id: consultationId || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: normalizeContract(data as Row),
        schema_ready: true,
      },
      { status: 201 }
    );
  } catch (e) {
    return errorResponse(e);
  }
}
