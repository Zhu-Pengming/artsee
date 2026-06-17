import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, invalidIdResponse, notFoundResponse, parsePagination } from "@/lib/api/route-helpers";
import { createNotification } from "@/lib/api/notifications";

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

async function ensureConsultationExists(
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
    const admin = await requireAdmin(req);
    if ("response" in admin) return admin.response;
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();
    const { data: consultation, error: consultationError } = await ensureConsultationExists(
      supabase,
      id
    );
    if (consultationError) return errorResponse(consultationError);
    if (!consultation) return notFoundResponse();

    const { data, error, count } = await supabase
      .from("consultation_messages")
      .select("*", { count: "exact" })
      .eq("consultation_id", id)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      if (isMissingMessagesTable(error)) {
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
    const admin = await requireAdmin(req);
    if ("response" in admin) return admin.response;
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
    const { data: consultation, error: consultationError } = await ensureConsultationExists(
      supabase,
      id
    );
    if (consultationError) return errorResponse(consultationError);
    if (!consultation) return notFoundResponse();

    const attachments = Array.isArray(body.attachments) ? body.attachments : [];
    const { data, error } = await supabase
      .from("consultation_messages")
      .insert({
        consultation_id: id,
        sender_user_id: admin.user.id,
        sender_role: "advisor",
        body: text,
        attachments,
      })
      .select("*")
      .single();

    if (error) {
      if (isMissingMessagesTable(error)) {
        const now = new Date().toISOString();
        await supabase
          .from("consultations")
          .update({
            last_message: text,
            status: "active",
            handler_last_read_at: now,
            updated_at: now,
          })
          .eq("id", id);
        return NextResponse.json({
          success: true,
          data: {
            id: null,
            consultation_id: id,
            sender_user_id: admin.user.id,
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
