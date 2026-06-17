import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/api/notifications";
import { requireUser } from "@/lib/api/authz";
import { errorResponse, invalidIdResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
type Row = Record<string, unknown>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MENTOR_STATUSES = new Set([
  "requested",
  "confirmed",
  "scheduled",
  "completed",
  "canceled",
  "rejected",
]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function mergeMetadata(current: unknown, patch: Row) {
  return {
    ...(current && typeof current === "object" && !Array.isArray(current)
      ? (current as Row)
      : {}),
    ...patch,
  };
}

function statusLabel(status: string) {
  return (
    {
      confirmed: "已确认",
      scheduled: "已排期",
      completed: "已完成",
      canceled: "已取消",
      rejected: "未通过",
      requested: "待确认",
    } as Record<string, string>
  )[status] ?? status;
}

function availabilitySlotId(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return "";
  return cleanText((metadata as Row).availability_slot_id);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const supabase = createServiceClient();
    const { data: booking, error: bookingError } = await supabase
      .from("mentor_bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (bookingError) return errorResponse(bookingError);
    if (!booking) return notFoundResponse();

    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("*")
      .eq("id", booking.mentor_id)
      .maybeSingle();

    if (mentorError) return errorResponse(mentorError);
    if (!mentor) return notFoundResponse();

    const isStudent = booking.student_user_id === auth.user.id;
    const isMentor = mentor.user_id === auth.user.id;
    if (!isStudent && !isMentor) return notFoundResponse();

    const body = (await req.json().catch(() => ({}))) as Row;
    const nextStatus = cleanText(body.status);
    const patch: Row = {};
    const metadataPatch: Row = {};

    if (nextStatus) {
      if (isMentor) {
        if (!MENTOR_STATUSES.has(nextStatus)) {
          return NextResponse.json(
            { success: false, error: "预约状态无效" },
            { status: 400 }
          );
        }
        patch.status = nextStatus;
      } else if (nextStatus === "canceled") {
        patch.status = "canceled";
      } else {
        return NextResponse.json(
          { success: false, error: "学生只能取消自己的预约" },
          { status: 403 }
        );
      }
      metadataPatch.status_updated_by = isMentor ? "mentor" : "student";
    }

    if (isMentor) {
      const advisorNote = cleanText(body.advisor_note ?? body.advisorNote);
      if (advisorNote || body.advisor_note === null || body.advisorNote === null) {
        patch.advisor_note = advisorNote || null;
      }
      const scheduledRaw = cleanText(body.scheduled_at ?? body.scheduledAt);
      if (scheduledRaw || body.scheduled_at === null || body.scheduledAt === null) {
        if (!scheduledRaw) {
          patch.scheduled_at = null;
        } else {
          const scheduledAt = new Date(scheduledRaw);
          if (Number.isNaN(scheduledAt.getTime())) {
            return NextResponse.json(
              { success: false, error: "预约时间格式无效" },
              { status: 400 }
            );
          }
          patch.scheduled_at = scheduledAt.toISOString();
        }
      }
    }

    if (isStudent) {
      const studentNote = cleanText(body.student_note ?? body.studentNote);
      if (studentNote || body.student_note === null || body.studentNote === null) {
        patch.student_note = studentNote || null;
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { success: false, error: "没有可更新的预约字段" },
        { status: 400 }
      );
    }

    patch.updated_at = new Date().toISOString();
    if (Object.keys(metadataPatch).length > 0) {
      patch.metadata = mergeMetadata(booking.metadata, metadataPatch);
    }

    const { data, error } = await supabase
      .from("mentor_bookings")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return errorResponse(error);

    const slotId = availabilitySlotId(booking.metadata);
    if (slotId && nextStatus) {
      const slotStatus =
        nextStatus === "canceled" || nextStatus === "rejected"
          ? "open"
          : nextStatus === "confirmed" ||
              nextStatus === "scheduled" ||
              nextStatus === "completed"
            ? "booked"
            : "";
      if (slotStatus) {
        const { data: slot } = await supabase
          .from("mentor_availability_slots")
          .select("*")
          .eq("id", slotId)
          .maybeSingle();
        const { error: slotError } = await supabase
          .from("mentor_availability_slots")
          .update({
            status: slotStatus,
            metadata:
              slotStatus === "open"
                ? mergeMetadata(slot?.metadata, { mentor_booking_id: null })
                : mergeMetadata(slot?.metadata, { mentor_booking_id: id }),
          })
          .eq("id", slotId)
          .select("id")
          .single();
        if (slotError) return errorResponse(slotError);
      }
    }

    if (nextStatus === "completed" && data.payment_status === "paid") {
      const { error: earningError } = await supabase
        .from("mentor_earnings")
        .update({
          status: "available",
          available_at: new Date().toISOString(),
        })
        .eq("mentor_booking_id", id)
        .select("id")
        .single();
      if (earningError) return errorResponse(earningError);
    }

    if (nextStatus) {
      const targetUserId = isMentor
        ? cleanText(booking.student_user_id)
        : cleanText(mentor.user_id);
      await createNotification(supabase, targetUserId, {
        title: `导师预约${statusLabel(nextStatus)}`,
        content: cleanText(body.advisor_note ?? body.student_note) || null,
        type: "mentor_booking",
        metadata: {
          mentor_booking_id: id,
          mentor_id: booking.mentor_id,
          status: nextStatus,
        },
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
