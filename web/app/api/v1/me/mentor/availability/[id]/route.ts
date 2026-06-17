import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { errorResponse, invalidIdResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLOT_STATUSES = new Set(["open", "reserved", "booked", "blocked", "archived"]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseDate(value: unknown) {
  const raw = cleanText(value);
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const supabase = createServiceClient();
    const { data: slot, error: slotError } = await supabase
      .from("mentor_availability_slots")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (slotError) return errorResponse(slotError);
    if (!slot) return notFoundResponse();

    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("*")
      .eq("id", slot.mentor_id)
      .maybeSingle();
    if (mentorError) return errorResponse(mentorError);
    if (!mentor || mentor.user_id !== auth.user.id) return notFoundResponse();

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    const startsAt = parseDate(body.starts_at ?? body.startsAt);
    const endsAt = parseDate(body.ends_at ?? body.endsAt);
    if (startsAt === null || endsAt === null) {
      return NextResponse.json(
        { success: false, error: "时间格式无效" },
        { status: 400 }
      );
    }
    if (startsAt) patch.starts_at = startsAt.toISOString();
    if (endsAt) patch.ends_at = endsAt.toISOString();

    const nextStart = startsAt ?? new Date(slot.starts_at);
    const nextEnd = endsAt ?? new Date(slot.ends_at);
    if (nextEnd <= nextStart) {
      return NextResponse.json(
        { success: false, error: "结束时间必须晚于开始时间" },
        { status: 400 }
      );
    }

    const status = cleanText(body.status);
    if (status) {
      if (!SLOT_STATUSES.has(status)) {
        return NextResponse.json(
          { success: false, error: "排期状态无效" },
          { status: 400 }
        );
      }
      patch.status = status;
    }
    const timezone = cleanText(body.timezone);
    if (timezone) patch.timezone = timezone;
    patch.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("mentor_availability_slots")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
