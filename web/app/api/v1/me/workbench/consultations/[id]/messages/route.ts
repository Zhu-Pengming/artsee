import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, invalidIdResponse, notFoundResponse, parsePagination } from "@/lib/api/route-helpers";
import {
  canAccessWorkbenchConsultation,
  findWorkbenchMembership,
  requireWorkbenchUser,
} from "@/lib/api/workbench-access";
import { createNotification } from "@/lib/api/notifications";
import { markConsultationRead } from "@/lib/api/consultation-unread";

type Ctx = { params: Promise<{ id: string }> };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isMissingMessagesTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes("consultation_messages"))
  );
}

function isMissingMessageDisplayColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "PGRST204" ||
    err.code === "42703" ||
    Boolean(err.message?.includes("organization_id")) ||
    Boolean(err.message?.includes("member_name")) ||
    Boolean(err.message?.includes("schema cache"))
  );
}

function objectMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

async function loadMemberName(
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
  return cleanText(data?.nickname) || fallback || "顾问老师";
}

async function getWorkbenchConsultation(
  supabase: ReturnType<typeof createServiceClient>,
  consultationId: string
) {
  return supabase
    .from("consultations")
    .select("*")
    .eq("id", consultationId)
    .maybeSingle();
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();
    const { data: consultation, error: consultationError } = await getWorkbenchConsultation(
      supabase,
      id
    );
    if (consultationError) return errorResponse(consultationError);
    if (!consultation) return notFoundResponse();
    if (
      !canAccessWorkbenchConsultation(
        consultation,
        auth.user.id,
        auth.canAccessPlatformPool,
        auth.organizationIds,
        auth.memberships
      )
    ) {
      return notFoundResponse();
    }

    const { data, error, count } = await supabase
      .from("consultation_messages")
      .select("*", { count: "exact" })
      .eq("consultation_id", id)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      if (isMissingMessagesTable(error)) {
        await markConsultationRead(supabase, id, "handler");
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

    await markConsultationRead(supabase, id, "handler");

    return NextResponse.json({
      success: true,
      data: data ?? [],
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const body = (await req.json().catch(() => ({}))) as {
      body?: unknown;
      message?: unknown;
      attachments?: unknown;
    };
    const text = cleanText(body.body) || cleanText(body.message);
    if (!text) {
      return NextResponse.json({ success: false, error: "消息不能为空" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: consultation, error: consultationError } = await getWorkbenchConsultation(
      supabase,
      id
    );
    if (consultationError) return errorResponse(consultationError);
    if (!consultation) return notFoundResponse();
    if (
      !canAccessWorkbenchConsultation(
        consultation,
        auth.user.id,
        auth.canAccessPlatformPool,
        auth.organizationIds,
        auth.memberships
      )
    ) {
      return notFoundResponse();
    }

    if (
      consultation.assigned_to_user_id == null &&
      consultation.assigned_to_org_id == null
    ) {
      const { error: claimError } = await supabase
        .from("consultations")
        .update({
          assigned_to_user_id: auth.user.id,
          assigned_to_org_id: null,
          status: consultation.status === "new" ? "pending" : consultation.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .is("assigned_to_user_id", null)
        .is("assigned_to_org_id", null);
      if (claimError) return errorResponse(claimError);
    }

    const attachments = Array.isArray(body.attachments) ? body.attachments : [];
    const organizationId = cleanText(consultation.assigned_to_org_id) || null;
    const membership = organizationId
      ? findWorkbenchMembership(auth.memberships, organizationId)
      : null;
    const memberName = await loadMemberName(
      supabase,
      auth.user.id,
      membership?.metadata
    );
    const messageInsert = {
      consultation_id: id,
      sender_user_id: auth.user.id,
      sender_role: "advisor",
      body: text,
      attachments,
      organization_id: organizationId,
      member_name: organizationId ? memberName : null,
    };
    let { data, error } = await supabase
      .from("consultation_messages")
      .insert(messageInsert)
      .select("*")
      .single();

    if (error && isMissingMessageDisplayColumn(error)) {
      const fallbackInsert = {
        consultation_id: id,
        sender_user_id: auth.user.id,
        sender_role: "advisor",
        body: text,
        attachments,
      };
      const fallback = await supabase
        .from("consultation_messages")
        .insert(fallbackInsert)
        .select("*")
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      if (isMissingMessagesTable(error)) {
        const now = new Date().toISOString();
        await supabase
          .from("consultations")
          .update({
            last_message: text,
            status: "active",
            updated_at: now,
            ...(consultation.assigned_to_user_id == null &&
            consultation.assigned_to_org_id == null
              ? { assigned_to_user_id: auth.user.id }
              : {}),
          })
          .eq("id", id);
        return NextResponse.json({
          success: true,
          data: {
            id: null,
            consultation_id: id,
            sender_user_id: auth.user.id,
            sender_role: "advisor",
            body: text,
            attachments,
            created_at: now,
          },
            schema_ready: false,
          });
      }
      return errorResponse(error);
    }

    await supabase
      .from("consultations")
      .update({
        last_message: text,
        status: "active",
        handler_last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(consultation.assigned_to_user_id == null &&
        consultation.assigned_to_org_id == null
          ? { assigned_to_user_id: auth.user.id }
          : {}),
      })
      .eq("id", id);
    await createNotification(supabase, consultation.user_id?.toString(), {
      title: `${consultation.target_name ?? "咨询"}有新回复`,
      content: text,
      type: "consultation_message",
      metadata: {
        consultation_id: id,
        target_type: consultation.target_type ?? null,
        target_name: consultation.target_name ?? null,
      },
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
