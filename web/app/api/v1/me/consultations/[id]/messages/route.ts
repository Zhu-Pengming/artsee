import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, invalidIdResponse, notFoundResponse, parsePagination } from "@/lib/api/route-helpers";
import { notifyConsultationHandlers } from "@/lib/api/notifications";
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

async function getOwnedConsultation(
  supabase: ReturnType<typeof createServiceClient>,
  consultationId: string,
  userId: string
) {
  return supabase
    .from("consultations")
    .select("*")
    .eq("id", consultationId)
    .eq("user_id", userId)
    .maybeSingle();
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();
    const { data: consultation, error: consultationError } = await getOwnedConsultation(
      supabase,
      id,
      user.id
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
        await markConsultationRead(supabase, id, "student");
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

    await markConsultationRead(supabase, id, "student");

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
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
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
    const { data: consultation, error: consultationError } = await getOwnedConsultation(
      supabase,
      id,
      user.id
    );
    if (consultationError) return errorResponse(consultationError);
    if (!consultation) return notFoundResponse();

    const attachments = Array.isArray(body.attachments) ? body.attachments : [];
    const { data, error } = await supabase
      .from("consultation_messages")
      .insert({
        consultation_id: id,
        sender_user_id: user.id,
        sender_role: "student",
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
          .update({ last_message: text, updated_at: now })
          .eq("id", id)
          .eq("user_id", user.id);
        return NextResponse.json({
          success: true,
          data: {
            id: null,
            consultation_id: id,
            sender_user_id: user.id,
            sender_role: "student",
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
        student_last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);
    await notifyConsultationHandlers(
      supabase,
      consultation,
      {
        title: `${consultation.target_name ?? "咨询"}有学生补充`,
        content: text,
        type: "consultation_message",
        metadata: {
          consultation_id: id,
          target_type: consultation.target_type ?? null,
          target_name: consultation.target_name ?? null,
        },
      },
      user.id
    );

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
