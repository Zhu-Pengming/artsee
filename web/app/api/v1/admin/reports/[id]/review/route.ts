import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/api/admin-audit";
import { createNotification } from "@/lib/api/notifications";
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
const REVIEW_STATUSES = new Set(["reviewing", "resolved", "dismissed"]);
const MODERATION_ACTIONS = new Set(["none", "hide_target", "restrict_user"]);

const TARGET_CONFIG: Record<
  string,
  {
    table: string;
    hiddenStatus: string;
    ownerField?: string;
    labelField?: string;
  }
> = {
  event: {
    table: "events",
    hiddenStatus: "archived",
    ownerField: "created_by",
    labelField: "title",
  },
  opportunity: {
    table: "opportunities",
    hiddenStatus: "archived",
    ownerField: "created_by",
    labelField: "title",
  },
  artwork: {
    table: "artworks",
    hiddenStatus: "archived",
    ownerField: "user_id",
    labelField: "title",
  },
  artist: {
    table: "artist_profiles",
    hiddenStatus: "hidden",
    ownerField: "user_id",
    labelField: "display_name",
  },
  post: {
    table: "community_posts",
    hiddenStatus: "hidden",
    ownerField: "author_id",
    labelField: "title",
  },
  comment: {
    table: "community_post_comments",
    hiddenStatus: "hidden",
    ownerField: "author_id",
  },
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function notificationTitle(status: string) {
  return status === "resolved"
    ? "举报已处理"
    : status === "dismissed"
      ? "举报已关闭"
      : "举报处理中";
}

function validateTransition(current: string, next: string) {
  if (["resolved", "dismissed"].includes(current)) return "已完结举报不可再次变更";
  if (next === "reviewing" && current !== "pending") return "只有待处理举报可进入处理中";
  if (["resolved", "dismissed"].includes(next) && !["pending", "reviewing"].includes(current)) {
    return "当前状态不可完结";
  }
  return null;
}

async function applyModerationAction(
  supabase: ReturnType<typeof createServiceClient>,
  report: Row,
  action: string,
  adminUserId: string,
  resolutionNote: string
) {
  if (action === "none") return { result: { action } };

  const targetType = cleanText(report.target_type);
  const targetId = cleanText(report.target_id);
  if (action === "restrict_user") {
    if (targetType !== "user") {
      return { error: new Error("restrict_user 只能用于用户举报") };
    }
    const { data: targetUser, error: readError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", targetId)
      .maybeSingle();
    if (readError) return { error: readError };
    if (!targetUser) return { error: new Error("被举报用户不存在") };
    if (cleanText(targetUser.role) === "admin") {
      return { error: new Error("不能通过举报流程限制管理员账号") };
    }
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        status: "banned",
        banned_at: now,
        banned_by_user_id: adminUserId,
        banned_reason: resolutionNote || "举报处理",
        updated_at: now,
      })
      .eq("id", targetId)
      .select("*")
      .single();
    if (error) return { error };
    await createNotification(supabase, targetId, {
      title: "账号状态已更新",
      content: resolutionNote || "平台已根据举报处理结果限制账号。",
      type: "user_admin_update",
      metadata: {
        report_id: report.id,
        status: "banned",
      },
    });
    return {
      result: {
        action,
        target_type: targetType,
        target_id: targetId,
        status: data.status,
      },
    };
  }

  if (action === "hide_target") {
    const config = TARGET_CONFIG[targetType];
    if (!config) {
      return { error: new Error("该举报对象暂不支持隐藏处置") };
    }
    const { data: target, error: readError } = await supabase
      .from(config.table)
      .select("*")
      .eq("id", targetId)
      .maybeSingle();
    if (readError) return { error: readError };
    if (!target) return { error: new Error("被举报对象不存在") };
    const { data, error } = await supabase
      .from(config.table)
      .update({ status: config.hiddenStatus })
      .eq("id", targetId)
      .select("*")
      .single();
    if (error) return { error };

    const ownerUserId = config.ownerField ? cleanText(target[config.ownerField]) : "";
    await createNotification(supabase, ownerUserId, {
      title: "内容已被平台处理",
      content: resolutionNote || cleanText(config.labelField ? target[config.labelField] : null) || null,
      type: "content_report",
      metadata: {
        report_id: report.id,
        target_type: targetType,
        target_id: targetId,
        status: config.hiddenStatus,
      },
    });
    return {
      result: {
        action,
        target_type: targetType,
        target_id: targetId,
        table: config.table,
        status: data.status,
      },
    };
  }

  return { error: new Error("无效处置动作") };
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const body = (await req.json().catch(() => ({}))) as Row;
    const status = cleanText(body.status);
    const resolutionNote = cleanText(body.resolution_note ?? body.resolutionNote);
    const moderationAction = cleanText(
      body.moderation_action ?? body.moderationAction
    ) || "none";
    if (!REVIEW_STATUSES.has(status)) {
      return NextResponse.json(
        { success: false, error: "status 必须是 reviewing、resolved 或 dismissed" },
        { status: 400 }
      );
    }
    if (!MODERATION_ACTIONS.has(moderationAction)) {
      return NextResponse.json({ success: false, error: "无效处置动作" }, { status: 400 });
    }
    if (moderationAction !== "none" && status !== "resolved") {
      return NextResponse.json(
        { success: false, error: "只有标记已处理时才能执行处置动作" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: report, error: reportError } = await supabase
      .from("content_reports")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (reportError) return errorResponse(reportError);
    if (!report) return notFoundResponse();

    const currentStatus = cleanText(report.status);
    const transitionError = validateTransition(currentStatus, status);
    if (transitionError) {
      return NextResponse.json({ success: false, error: transitionError }, { status: 400 });
    }

    const now = new Date().toISOString();
    const moderation = await applyModerationAction(
      supabase,
      report,
      moderationAction,
      admin.user.id,
      resolutionNote
    );
    if (moderation.error) return errorResponse(moderation.error, 400);

    const { data, error } = await supabase
      .from("content_reports")
      .update({
        status,
        reviewed_by_user_id: admin.user.id,
        reviewed_at: now,
        resolution_note: resolutionNote || null,
        metadata: {
          ...objectValue(report.metadata),
          review: {
            status,
            reviewed_by_user_id: admin.user.id,
            reviewed_at: now,
            resolution_note: resolutionNote || null,
            moderation_action: moderationAction,
            moderation_result: moderation.result ?? null,
          },
        },
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return errorResponse(error);

    await createNotification(supabase, cleanText(report.reporter_user_id), {
      title: notificationTitle(status),
      content: resolutionNote || null,
      type: "content_report",
      metadata: {
        report_id: id,
        target_type: report.target_type,
        target_id: report.target_id,
        status,
        moderation_action: moderationAction,
      },
    });

    await writeAdminAuditLog(supabase, req, {
      actorUserId: admin.user.id,
      action: "content_report.review",
      targetType: "content_report",
      targetId: id,
      targetLabel: `${report.target_type}:${report.target_id}`,
      metadata: {
        previous_status: currentStatus,
        final_status: status,
        reason: report.reason,
        target_type: report.target_type,
        target_id: report.target_id,
        moderation_action: moderationAction,
        moderation_result: moderation.result ?? null,
      },
    });

    return NextResponse.json({ success: true, data, moderation: moderation.result ?? null });
  } catch (e) {
    return errorResponse(e);
  }
}
