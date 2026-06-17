import { NextRequest, NextResponse } from "next/server";
import {
  CONTRACT_STATUSES,
  cleanText,
  isMissingContractsSchema,
  normalizeContract,
  optionalUuid,
} from "@/lib/api/contracts";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";
import { requireWorkbenchUser } from "@/lib/api/workbench-access";

type Row = Record<string, unknown>;

function mapById(rows: Row[]) {
  return new Map(
    rows
      .map((row) => [typeof row.id === "string" ? row.id : "", row] as const)
      .filter(([id]) => Boolean(id))
  );
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;

    if (auth.manageableOrganizationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "仅机构所有者或管理员可查看合同存档" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const status = cleanText(searchParams.get("status"));
    const requestedOrganizationId = cleanText(searchParams.get("organization_id"));
    const organizationId = requestedOrganizationId ? optionalUuid(requestedOrganizationId) : "";

    if (status && !CONTRACT_STATUSES.has(status)) {
      return NextResponse.json({ success: false, error: "无效合同状态" }, { status: 400 });
    }
    if (requestedOrganizationId && !organizationId) {
      return NextResponse.json({ success: false, error: "organization_id 无效" }, { status: 400 });
    }
    if (organizationId && !auth.manageableOrganizationIds.includes(organizationId)) {
      return NextResponse.json({ success: false, error: "无权查看该机构合同" }, { status: 403 });
    }

    const organizationIds = organizationId ? [organizationId] : auth.manageableOrganizationIds;
    const supabase = createServiceClient();
    let query = supabase
      .from("contracts")
      .select(
        "*, organization:organizations(id,name,type,status,city,province,metadata,contract_count), consultation:consultations(id,target_type,target_id,target_name,topic,status,created_at)",
        { count: "exact" }
      )
      .in("organization_id", organizationIds)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);

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

    const rows = (data ?? []) as Row[];
    const userIds = Array.from(
      new Set(
        rows
          .map((row) => (typeof row.user_id === "string" ? row.user_id : ""))
          .filter(Boolean)
      )
    );

    const { data: profiles, error: profileError } =
      userIds.length > 0
        ? await supabase
            .from("user_profiles")
            .select("id,nickname,avatar_url,role,user_role,user_type")
            .in("id", userIds)
        : { data: [], error: null };
    if (profileError) return errorResponse(profileError);

    const profilesById = mapById((profiles ?? []) as Row[]);
    const contracts = rows.map((row) =>
      normalizeContract(
        row,
        typeof row.user_id === "string" ? profilesById.get(row.user_id) ?? null : null
      )
    );

    return NextResponse.json({
      success: true,
      data: contracts,
      count,
      pagination: { limit, offset },
      organization_ids: organizationIds,
      schema_ready: true,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
