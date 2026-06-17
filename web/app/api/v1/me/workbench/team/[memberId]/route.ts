import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/api/notifications";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";
import {
  canManageWorkbenchOrganization,
  requireWorkbenchUser,
} from "@/lib/api/workbench-access";

type Ctx = { params: Promise<{ memberId: string }> };
type Row = Record<string, unknown>;

const MEMBER_ROLES = new Set(["admin", "advisor", "member"]);
const MEMBER_STATUSES = new Set(["active", "invited", "disabled"]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;

    const { memberId } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Row;
    const role = cleanText(body.role);
    const status = cleanText(body.status);
    const displayName = cleanText(body.display_name);

    const supabase = createServiceClient();
    const { data: existing, error: existingError } = await supabase
      .from("organization_members")
      .select("id,organization_id,user_id,role,status,metadata,created_at,updated_at")
      .eq("id", memberId)
      .maybeSingle();

    if (existingError) return errorResponse(existingError);
    if (!existing) return notFoundResponse();

    const organizationId = cleanText(existing.organization_id);
    if (!canManageWorkbenchOrganization(auth.memberships, organizationId)) {
      return notFoundResponse();
    }

    if (existing.role === "owner") {
      return NextResponse.json(
        { success: false, error: "不能在团队管理中修改机构所有者" },
        { status: 400 }
      );
    }

    const patch: Row = {
      updated_at: new Date().toISOString(),
    };
    if (role) {
      if (!MEMBER_ROLES.has(role)) {
        return NextResponse.json({ success: false, error: "无效成员角色" }, { status: 400 });
      }
      patch.role = role;
    }
    if (status) {
      if (!MEMBER_STATUSES.has(status)) {
        return NextResponse.json({ success: false, error: "无效成员状态" }, { status: 400 });
      }
      patch.status = status;
    }
    if (displayName || "display_name" in body) {
      patch.metadata = {
        ...objectMetadata(existing.metadata),
        display_name: displayName || null,
        updated_by_user_id: auth.user.id,
        updated_at: new Date().toISOString(),
      };
    }

    if (Object.keys(patch).length === 1) {
      return NextResponse.json({ success: false, error: "没有可更新字段" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("organization_members")
      .update(patch)
      .eq("id", memberId)
      .select("id,organization_id,user_id,role,status,metadata,created_at,updated_at")
      .single();
    if (error) return errorResponse(error);

    await createNotification(supabase, cleanText(existing.user_id), {
      title: status === "disabled" ? "你的机构成员权限已停用" : "你的机构成员信息已更新",
      content: role ? `当前角色：${role}` : null,
      type: "organization_member_updated",
      metadata: {
        organization_id: organizationId,
        member_id: memberId,
        role: role || undefined,
        status: status || undefined,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
