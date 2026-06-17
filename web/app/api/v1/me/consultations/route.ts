import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { attachConsultationUnreadCounts } from "@/lib/api/consultation-unread";
import { getUserMembership } from "@/lib/api/membership";
import { notifyConsultationHandlers } from "@/lib/api/notifications";
import { effectiveOrganizationSubscriptionStatus } from "@/lib/api/organization-subscription";

type ConsultationRequestBody = {
  target_type?: string;
  target_id?: string;
  target_name?: string;
  topic?: string;
  target_major?: string;
  intake?: string;
  stage?: string;
  source?: string;
  organization_id?: string;
  channel?: string;
  metadata?: unknown;
  message?: string;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function isMissingConsultationColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "PGRST204" ||
    err.code === "42703" ||
    Boolean(err.message?.includes("schema cache"))
  );
}

async function insertInitialMessage(
  supabase: ReturnType<typeof createServiceClient>,
  consultationId: string,
  userId: string,
  message: string
) {
  if (!message) return null;
  const { error } = await supabase.from("consultation_messages").insert({
    consultation_id: consultationId,
    sender_user_id: userId,
    sender_role: "student",
    body: message,
    attachments: [],
  });
  if (!error) return null;

  const missingMessagesTable =
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.message?.includes("consultation_messages");
  return missingMessagesTable ? null : error;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();
    const { data, error, count } = await supabase
      .from("consultations")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return errorResponse(error);
    const rows = await attachConsultationUnreadCounts(
      supabase,
      data ?? [],
      "student"
    );
    return NextResponse.json({ success: true, data: rows, count, pagination: { limit, offset } });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const body = (await req.json().catch(() => ({}))) as ConsultationRequestBody;
    const targetType = cleanText(body.target_type) || "school";
    let targetName = cleanText(body.target_name);
    const message = cleanText(body.message);
    const topic = cleanText(body.topic);
    const targetMajor = cleanText(body.target_major);
    const intake = cleanText(body.intake);
    const stage = cleanText(body.stage);
    const source = cleanText(body.source) || (targetType === "school" ? "school_detail" : targetType);
    const organizationId = cleanText(body.organization_id);
    const supabase = createServiceClient();
    let organization: Record<string, unknown> | null = null;

    if (organizationId) {
      const membership = await getUserMembership(supabase, user.id);
      if (membership.error) return errorResponse(membership.error);
      if (!membership.data?.is_member) {
        return NextResponse.json(
          { success: false, error: "请先升级会员后发起机构咨询" },
          { status: 402 }
        );
      }

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select(
          "id,name,status,supports_online,subscription_status,subscription_expires_at"
        )
        .eq("id", organizationId)
        .maybeSingle();
      if (orgError) return errorResponse(orgError);
      if (!org || org.status !== "active") {
        return NextResponse.json({ success: false, error: "机构不可用" }, { status: 404 });
      }
      if (effectiveOrganizationSubscriptionStatus(org as Record<string, unknown>) !== "active") {
        return NextResponse.json(
          { success: false, error: "该机构尚未完成入驻年费，暂不可咨询" },
          { status: 403 }
        );
      }
      if (org.supports_online === false) {
        return NextResponse.json(
          { success: false, error: "该机构暂不支持线上咨询" },
          { status: 400 }
        );
      }
      organization = org as Record<string, unknown>;
      targetName = targetName || cleanText(organization.name) || "机构咨询";
    }

    if (!targetName) {
      return NextResponse.json({ success: false, error: "target_name 必填" }, { status: 400 });
    }

    const metadata = {
      ...objectMetadata(body.metadata),
      assignment_pool: organizationId ? "organization" : "platform_advisor",
      ...(organizationId
        ? {
            organization_id: organizationId,
            organization_name: cleanText(organization?.name) || null,
            consultation_channel: cleanText(body.channel) || "online",
          }
        : {}),
    };

    const insertPayload = {
      user_id: user.id,
      target_type: targetType,
      target_id: cleanText(body.target_id) || null,
      target_name: targetName,
      last_message: message || null,
      status: "new",
      assigned_to_user_id: null,
      assigned_to_org_id: organizationId || null,
      source,
      topic: topic || null,
      target_major: targetMajor || null,
      intake: intake || null,
      stage: stage || null,
      metadata,
      student_last_read_at: new Date().toISOString(),
      handler_last_read_at: null,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("consultations")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error && isMissingConsultationColumn(error)) {
      const fallback = await supabase
        .from("consultations")
        .insert({
          user_id: user.id,
          target_type: targetType,
          target_id: cleanText(body.target_id) || null,
          target_name: targetName,
          last_message: message || null,
          status: "pending",
        })
        .select("*")
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) return errorResponse(error);
    if (data?.id) {
      const messageError = await insertInitialMessage(
        supabase,
        data.id,
        user.id,
        message
      );
      if (messageError) return errorResponse(messageError);
      await notifyConsultationHandlers(
        supabase,
        data,
        {
          title: `${targetName}有新咨询`,
          content: message || "学生发起了新的机构咨询",
          type: "consultation",
          metadata: {
            consultation_id: data.id,
            target_type: targetType,
            target_name: targetName,
            organization_id: organizationId || null,
          },
        },
        user.id
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
