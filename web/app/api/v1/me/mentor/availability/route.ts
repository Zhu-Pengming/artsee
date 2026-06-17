import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseDate(value: unknown) {
  const raw = cleanText(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function getOwnMentor(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string
) {
  return supabase
    .from("mentors")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status")?.trim();
    const supabase = createServiceClient();
    const { data: mentor, error: mentorError } = await getOwnMentor(
      supabase,
      auth.user.id
    );
    if (mentorError) return errorResponse(mentorError);
    if (!mentor) {
      return NextResponse.json({ success: true, data: [], count: 0, pagination: { limit, offset } });
    }

    let query = supabase
      .from("mentor_availability_slots")
      .select("*", { count: "exact" })
      .eq("mentor_id", mentor.id)
      .order("starts_at", { ascending: true })
      .range(offset, offset + limit - 1);
    if (status) query = query.eq("status", status);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data, count, pagination: { limit, offset } });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const startsAt = parseDate(body.starts_at ?? body.startsAt);
    const endsAt = parseDate(body.ends_at ?? body.endsAt);
    if (!startsAt || !endsAt || endsAt <= startsAt) {
      return NextResponse.json(
        { success: false, error: "请填写有效的开始和结束时间" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: mentor, error: mentorError } = await getOwnMentor(
      supabase,
      auth.user.id
    );
    if (mentorError) return errorResponse(mentorError);
    if (!mentor) {
      return NextResponse.json(
        { success: false, error: "请先提交导师认证申请" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("mentor_availability_slots")
      .insert({
        mentor_id: mentor.id,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        timezone: cleanText(body.timezone) || "Asia/Shanghai",
        status: cleanText(body.status) || "open",
        metadata:
          body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
            ? body.metadata
            : {},
      })
      .select("*")
      .single();

    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
