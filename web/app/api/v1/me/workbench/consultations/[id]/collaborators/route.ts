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
const MODES = new Set(["replace", "add", "remove"]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item))
    .filter((item) => item.length > 0);
}

function objectMetadata(value: unknown): Row {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function existingCollaborators(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") {
        return { user_id: item, member_id: null, name: null, role: null };
      }
      if (!item || typeof item !== "object") return null;
      const row = item as Row;
      const userId = cleanText(row.user_id);
      const memberId = cleanText(row.member_id);
      if (!userId && !memberId) return null;
      return {
        user_id: userId || null,
        member_id: memberId || null,
        name: cleanText(row.name) || null,
        role: cleanText(row.role) || null,
      };
    })
    .filter((item): item is Collaborator => Boolean(item));
}

type Collaborator = {
  user_id: string | null;
  member_id: string | null;
  name: string | null;
  role: string | null;
};

function isMissingCollaboratorColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "PGRST204" ||
    err.code === "42703" ||
    Boolean(err.message?.includes("collaborator_ids")) ||
    Boolean(err.message?.includes("schema cache"))
  );
}

function canEditCollaborators(
  consultation: Row,
  authUserId: string,
  authMemberIds: string[],
  isManager: boolean
) {
  if (isManager) return true;
  if (consultation.primary_advisor_id === authUserId) return true;
  if (consultation.assigned_to_user_id === authUserId) return true;
  return (
    typeof consultation.assigned_to_member_id === "string" &&
    authMemberIds.includes(consultation.assigned_to_member_id)
  );
}

async function loadMembers(
  supabase: ReturnType<typeof createServiceClient>,
  organizationId: string,
  memberIds: string[],
  memberUserIds: string[]
) {
  const byMemberId =
    memberIds.length > 0
      ? await supabase
          .from("organization_members")
          .select("id,organization_id,user_id,role,status,metadata")
          .eq("organization_id", organizationId)
          .eq("status", "active")
          .in("id", memberIds)
      : { data: [], error: null };

  if (byMemberId.error) return byMemberId;

  const byUserId =
    memberUserIds.length > 0
      ? await supabase
          .from("organization_members")
          .select("id,organization_id,user_id,role,status,metadata")
          .eq("organization_id", organizationId)
          .eq("status", "active")
          .in("user_id", memberUserIds)
      : { data: [], error: null };

  if (byUserId.error) return byUserId;

  const rows = [...(byMemberId.data ?? []), ...(byUserId.data ?? [])] as Row[];
  const byId = new Map<string, Row>();
  for (const row of rows) {
    const id = cleanText(row.id);
    if (id) byId.set(id, row);
  }
  return { data: Array.from(byId.values()), error: null };
}

async function loadProfileNames(
  supabase: ReturnType<typeof createServiceClient>,
  userIds: string[]
) {
  if (userIds.length === 0) return new Map<string, string>();
  const { data } = await supabase
    .from("user_profiles")
    .select("id,nickname")
    .in("id", userIds);
  const names = new Map<string, string>();
  for (const row of (data ?? []) as Row[]) {
    const id = cleanText(row.id);
    const name = cleanText(row.nickname);
    if (id && name) names.set(id, name);
  }
  return names;
}

function collaboratorKey(collaborator: Collaborator) {
  return collaborator.member_id || collaborator.user_id || "";
}

function mergeCollaborators(existing: Collaborator[], incoming: Collaborator[]) {
  const merged = new Map<string, Collaborator>();
  for (const item of existing) {
    const key = collaboratorKey(item);
    if (key) merged.set(key, item);
  }
  for (const item of incoming) {
    const key = collaboratorKey(item);
    if (key) merged.set(key, item);
  }
  return Array.from(merged.values());
}

function removeCollaborators(existing: Collaborator[], incoming: Collaborator[]) {
  const removing = new Set(incoming.map(collaboratorKey));
  return existing.filter((item) => !removing.has(collaboratorKey(item)));
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const body = (await req.json().catch(() => ({}))) as {
      mode?: unknown;
      member_ids?: unknown;
      member_user_ids?: unknown;
      note?: unknown;
    };
    const mode = cleanText(body.mode) || "replace";
    if (!MODES.has(mode)) {
      return NextResponse.json(
        { success: false, error: "无效协作模式" },
        { status: 400 }
      );
    }

    const memberIds = cleanStringArray(body.member_ids);
    const memberUserIds = cleanStringArray(body.member_user_ids);
    if (mode !== "replace" && memberIds.length === 0 && memberUserIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "请选择协作老师" },
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

    const isManager = canManageWorkbenchOrganization(auth.memberships, organizationId);
    if (
      !canEditCollaborators(
        consultation as Row,
        auth.user.id,
        auth.memberIds,
        isManager
      )
    ) {
      return notFoundResponse();
    }

    const { data: members, error: memberError } = await loadMembers(
      supabase,
      organizationId,
      memberIds,
      memberUserIds
    );

    if (memberError) return errorResponse(memberError);

    if ((memberIds.length > 0 || memberUserIds.length > 0) && (members ?? []).length === 0) {
      return NextResponse.json(
        { success: false, error: "协作成员不存在或不属于该机构" },
        { status: 404 }
      );
    }

    const userIds = ((members ?? []) as Row[])
      .map((member) => cleanText(member.user_id))
      .filter((userId) => userId.length > 0);
    const profileNames = await loadProfileNames(supabase, userIds);
    const incoming = ((members ?? []) as Row[]).map((member) => {
      const userId = cleanText(member.user_id);
      const metadata = objectMetadata(member.metadata);
      return {
        member_id: cleanText(member.id),
        user_id: userId,
        name:
          profileNames.get(userId) ||
          cleanText(metadata.display_name) ||
          "机构成员",
        role: cleanText(member.role) || null,
      };
    });

    const current = existingCollaborators(consultation.collaborator_ids);
    const next =
      mode === "add"
        ? mergeCollaborators(current, incoming)
        : mode === "remove"
          ? removeCollaborators(current, incoming)
          : incoming;

    const now = new Date().toISOString();
    const metadata = objectMetadata(consultation.metadata);
    const { data, error } = await supabase
      .from("consultations")
      .update({
        collaborator_ids: next,
        updated_at: now,
        metadata: {
          ...metadata,
          internal_collaboration: {
            mode,
            organization_id: organizationId,
            updated_by_user_id: auth.user.id,
            updated_at: now,
            note: cleanText(body.note) || null,
            count: next.length,
          },
        },
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (isMissingCollaboratorColumn(error)) {
        return NextResponse.json(
          { success: false, error: "协作老师字段尚未迁移", schema_ready: false },
          { status: 503 }
        );
      }
      return errorResponse(error);
    }

    if (mode !== "remove") {
      const existingKeys = new Set(current.map(collaboratorKey));
      const added = incoming.filter((item) => !existingKeys.has(collaboratorKey(item)));
      await Promise.all(
        added.map((collaborator) =>
          createNotification(supabase, collaborator.user_id, {
            title: "你已被加入协作咨询",
            content: cleanText(consultation.topic) || cleanText(consultation.target_name),
            type: "workbench_collaboration",
            metadata: {
              consultation_id: id,
              organization_id: organizationId,
              member_id: collaborator.member_id,
              target_name: consultation.target_name ?? null,
            },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      data,
      collaborators: next,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
