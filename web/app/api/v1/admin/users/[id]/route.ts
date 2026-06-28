import { NextRequest, NextResponse } from "next/server";
import { isAdminRole } from "@/lib/api/admin-roles";
import { writeAdminAuditLog } from "@/lib/api/admin-audit";
import { createNotification } from "@/lib/api/notifications";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };

const USER_STATUSES = new Set(["active", "banned", "disabled", "pending"]);
const SYSTEM_ROLES = new Set(["user", "admin", "super_admin", "creator", "mentor", "institution"]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function booleanValue(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const role = cleanText(body.role);
    const status = cleanText(body.status);
    const adminNote = cleanText(body.admin_note ?? body.adminNote);
    const bannedReason = cleanText(body.banned_reason ?? body.bannedReason);
    const isVerified = booleanValue(body.is_verified ?? body.isVerified);

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (role) {
      if (!SYSTEM_ROLES.has(role)) {
        return NextResponse.json({ success: false, error: "无效系统角色" }, { status: 400 });
      }
      if (id === admin.user.id && !isAdminRole(role)) {
        return NextResponse.json(
          { success: false, error: "不能移除自己的管理员权限" },
          { status: 400 }
        );
      }
      patch.role = role;
    }

    if (status) {
      if (!USER_STATUSES.has(status)) {
        return NextResponse.json({ success: false, error: "无效用户状态" }, { status: 400 });
      }
      if (id === admin.user.id && status !== "active") {
        return NextResponse.json(
          { success: false, error: "不能限制自己的账号" },
          { status: 400 }
        );
      }
      patch.status = status;
      if (status === "banned" || status === "disabled") {
        patch.banned_at = new Date().toISOString();
        patch.banned_by_user_id = admin.user.id;
        patch.banned_reason = bannedReason || null;
      } else if (status === "active") {
        patch.banned_at = null;
        patch.banned_by_user_id = null;
        patch.banned_reason = null;
      }
    }

    if (adminNote || "admin_note" in body || "adminNote" in body) {
      patch.admin_note = adminNote || null;
    }
    if (isVerified !== null) {
      patch.is_verified = isVerified;
    }

    if (Object.keys(patch).length === 1) {
      return NextResponse.json({ success: false, error: "没有可更新字段" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .update(patch)
      .eq("id", id)
      .select(
        "id,nickname,avatar_url,role,status,is_verified,user_type,user_role,creator_level,content_count,creator_score,created_at,updated_at,last_login_at,banned_at,banned_by_user_id,banned_reason,admin_note"
      )
      .single();
    if (error) return errorResponse(error);
    if (!data) return notFoundResponse();

    if (status || role) {
      await createNotification(supabase, id, {
        title: status === "active" ? "账号限制已解除" : status ? "账号状态已更新" : "账号角色已更新",
        content: bannedReason || adminNote || null,
        type: "user_admin_update",
        metadata: {
          role: role || undefined,
          status: status || undefined,
        },
      });
    }

    await writeAdminAuditLog(supabase, req, {
      actorUserId: admin.user.id,
      action: "user.update",
      targetType: "user_profile",
      targetId: id,
      targetLabel: cleanText(data.nickname) || null,
      metadata: {
        updated_fields: Object.keys(patch).filter((key) => key !== "updated_at"),
        role: role || undefined,
        status: status || undefined,
        is_verified: isVerified ?? undefined,
        has_admin_note: Boolean(adminNote),
        has_banned_reason: Boolean(bannedReason),
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
