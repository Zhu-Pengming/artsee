import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/api/notifications";
import {
  errorResponse,
  invalidIdResponse,
  notFoundResponse,
} from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";
import {
  canManageWorkbenchOrganization,
  requireWorkbenchUser,
} from "@/lib/api/workbench-access";

type Ctx = { params: Promise<{ id: string }> };
type Row = Record<string, unknown>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNullableText(value: unknown) {
  if (value === null) return null;
  const text = cleanText(value);
  return text || undefined;
}

function objectMetadata(value: unknown): Row {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function isMissingAssignmentColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "PGRST204" ||
    err.code === "42703" ||
    Boolean(err.message?.includes("assigned_to_member_id")) ||
    Boolean(err.message?.includes("primary_advisor_id")) ||
    Boolean(err.message?.includes("schema cache"))
  );
}

async function loadActiveMember(
  supabase: ReturnType<typeof createServiceClient>,
  organizationId: string,
  memberId?: string | null,
  memberUserId?: string | null
) {
  let query = supabase
    .from("organization_members")
    .select("id,organization_id,user_id,role,status,metadata")
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (memberId) query = query.eq("id", memberId);
  if (memberUserId) query = query.eq("user_id", memberUserId);

  return query.maybeSingle();
}

async function loadDisplayName(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  fallbackMetadata: unknown
) {
  const fallback = cleanText(objectMetadata(fallbackMetadata).display_name);
  const { data } = await supabase
    .from("user_profiles")
    .select("nickname")
    .eq("id", userId)
    .maybeSingle();
  return cleanText(data?.nickname) || fallback || "机构成员";
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const body = (await req.json().catch(() => ({}))) as {
      member_id?: unknown;
      member_user_id?: unknown;
      note?: unknown;
    };
    const requestedMemberId = cleanNullableText(body.member_id);
    const requestedMemberUserId = cleanNullableText(body.member_user_id);
    const clearingAssignment =
      body.member_id === null || body.member_user_id === null;

    if (!clearingAssignment && !requestedMemberId && !requestedMemberUserId) {
      return NextResponse.json(
        { success: false, error: "请选择要分配的机构成员" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: consultation, error: consultationError } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (consultationError) return errorResponse(consultationError);
    if (!consultation) return notFoundResponse();

    const organizationId = cleanText(consultation.assigned_to_org_id);
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "咨询尚未分配给机构" },
        { status: 400 }
      );
    }

    if (!canManageWorkbenchOrganization(auth.memberships, organizationId)) {
      return notFoundResponse();
    }

    const now = new Date().toISOString();
    const metadata = objectMetadata(consultation.metadata);
    const patch: Row = {
      updated_at: now,
      metadata: {
        ...metadata,
        internal_assignment: {
          organization_id: organizationId,
          assigned_by_user_id: auth.user.id,
          assigned_at: now,
          note: cleanNullableText(body.note) ?? null,
          cleared: clearingAssignment,
        },
      },
    };
    let assignedMember: Row | null = null;
    let displayName: string | null = null;

    if (clearingAssignment) {
      patch.assigned_to_member_id = null;
      patch.primary_advisor_id = null;
      patch.assigned_to_user_id = null;
    } else {
      const { data: member, error: memberError } = await loadActiveMember(
        supabase,
        organizationId,
        requestedMemberId ?? null,
        requestedMemberUserId ?? null
      );

      if (memberError) return errorResponse(memberError);
      if (!member) {
        return NextResponse.json(
          { success: false, error: "成员不存在或不属于该机构" },
          { status: 404 }
        );
      }

      assignedMember = member as Row;
      const memberId = cleanText(assignedMember.id);
      const memberUserId = cleanText(assignedMember.user_id);
      displayName = await loadDisplayName(
        supabase,
        memberUserId,
        assignedMember.metadata
      );

      patch.assigned_to_member_id = memberId;
      patch.primary_advisor_id = memberUserId;
      patch.assigned_to_user_id = memberUserId;
      patch.status = consultation.status === "new" ? "pending" : consultation.status;
      patch.metadata = {
        ...metadata,
        internal_assignment: {
          organization_id: organizationId,
          member_id: memberId,
          member_user_id: memberUserId,
          member_name: displayName,
          member_role: assignedMember.role ?? null,
          assigned_by_user_id: auth.user.id,
          assigned_at: now,
          note: cleanNullableText(body.note) ?? null,
          cleared: false,
        },
      };
    }

    const { data, error } = await supabase
      .from("consultations")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (isMissingAssignmentColumn(error)) {
        return NextResponse.json(
          { success: false, error: "机构成员分配字段尚未迁移", schema_ready: false },
          { status: 503 }
        );
      }
      return errorResponse(error);
    }

    if (!clearingAssignment && assignedMember) {
      await createNotification(supabase, cleanText(assignedMember.user_id), {
        title: "你有新的咨询分配",
        content: cleanText(consultation.topic) || cleanText(consultation.target_name),
        type: "workbench_assignment",
        metadata: {
          consultation_id: id,
          organization_id: organizationId,
          member_id: assignedMember.id ?? null,
          target_name: consultation.target_name ?? null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data,
      assigned_member: assignedMember
        ? { ...assignedMember, display_name: displayName }
        : null,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
