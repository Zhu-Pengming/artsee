import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/api/notifications";
import { requireUser } from "@/lib/api/authz";
import { errorResponse, invalidIdResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function positiveInt(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function makeOrderNo() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AQ${stamp}${rand}`;
}

function mergeMetadata(current: unknown, patch: Record<string, unknown>) {
  return {
    ...(current && typeof current === "object" && !Array.isArray(current)
      ? (current as Record<string, unknown>)
      : {}),
    ...patch,
  };
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const serviceId = cleanText(body.service_id ?? body.serviceId);
    if (!UUID_RE.test(serviceId)) {
      return NextResponse.json(
        { success: false, error: "请选择有效导师服务" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (mentorError) return errorResponse(mentorError);
    if (!mentor) return notFoundResponse();
    if (!(mentor.status === "active" && mentor.verification_status === "verified")) {
      return notFoundResponse();
    }

    const { data: service, error: serviceError } = await supabase
      .from("mentor_services")
      .select("*")
      .eq("id", serviceId)
      .eq("mentor_id", id)
      .eq("status", "active")
      .maybeSingle();

    if (serviceError) return errorResponse(serviceError);
    if (!service) {
      return NextResponse.json(
        { success: false, error: "导师服务不存在或已下架" },
        { status: 404 }
      );
    }

    const scheduledRaw = cleanText(body.scheduled_at ?? body.scheduledAt);
    const slotId = cleanText(
      body.availability_slot_id ?? body.availabilitySlotId ?? body.slot_id ?? body.slotId
    );
    let scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null;
    if (scheduledRaw && Number.isNaN(scheduledAt?.getTime())) {
      return NextResponse.json(
        { success: false, error: "预约时间格式无效" },
        { status: 400 }
      );
    }

    let slot: Record<string, unknown> | null = null;
    if (slotId) {
      if (!UUID_RE.test(slotId)) return invalidIdResponse();
      const { data: slotData, error: slotError } = await supabase
        .from("mentor_availability_slots")
        .select("*")
        .eq("id", slotId)
        .eq("mentor_id", id)
        .eq("status", "open")
        .maybeSingle();
      if (slotError) return errorResponse(slotError);
      if (!slotData) {
        return NextResponse.json(
          { success: false, error: "该预约时间不可用" },
          { status: 409 }
        );
      }
      slot = slotData;
      scheduledAt = new Date(String(slotData.starts_at));
    }

    const { data, error } = await supabase
      .from("mentor_bookings")
      .insert({
        mentor_id: id,
        mentor_service_id: serviceId,
        student_user_id: auth.user.id,
        scheduled_at: scheduledAt ? scheduledAt.toISOString() : null,
        status: "requested",
        payment_status: positiveInt(service.price_amount) > 0 ? "unpaid" : "waived",
        student_note: cleanText(body.student_note ?? body.note) || null,
        metadata: {
          service_title: service.title ?? null,
          service_type: service.service_type ?? null,
          duration_minutes: service.duration_minutes ?? null,
          price_amount: service.price_amount ?? null,
          currency: service.currency ?? null,
          ...(slot
            ? {
                availability_slot_id: slot.id,
                availability_ends_at: slot.ends_at ?? null,
                availability_timezone: slot.timezone ?? null,
              }
            : {}),
        },
      })
      .select("*")
      .single();

    if (error) return errorResponse(error);
    let booking = data;
    const priceAmount = positiveInt(service.price_amount);
    if (priceAmount > 0) {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: auth.user.id,
          order_no: makeOrderNo(),
          subject: service.title?.toString() || "导师预约服务",
          item_type: "mentor_booking",
          item_id: data.id,
          amount_total: priceAmount,
          currency: (service.currency?.toString() || "cny").toLowerCase(),
          status: "pending",
          provider: "internal",
          metadata: {
            mentor_id: id,
            mentor_booking_id: data.id,
            mentor_service_id: serviceId,
          },
        })
        .select("*")
        .single();
      if (orderError) return errorResponse(orderError);

      const { data: updatedBooking, error: bookingUpdateError } = await supabase
        .from("mentor_bookings")
        .update({
          order_id: order.id,
          payment_status: "unpaid",
          metadata: mergeMetadata(data.metadata, { order_id: order.id }),
        })
        .eq("id", data.id)
        .select("*")
        .single();
      if (bookingUpdateError) return errorResponse(bookingUpdateError);
      booking = updatedBooking;
    }

    if (slot) {
      const { error: slotUpdateError } = await supabase
        .from("mentor_availability_slots")
        .update({
          status: "reserved",
          metadata: mergeMetadata(slot.metadata, {
            mentor_booking_id: data.id,
            student_user_id: auth.user.id,
          }),
        })
        .eq("id", slot.id)
        .select("id")
        .single();
      if (slotUpdateError) return errorResponse(slotUpdateError);
    }
    await createNotification(supabase, mentor.user_id?.toString(), {
      title: "你有新的导师预约",
      content: service.title?.toString() ?? null,
        type: "mentor_booking",
      metadata: {
        mentor_booking_id: booking.id,
        mentor_id: id,
        mentor_service_id: serviceId,
        order_id: booking.order_id ?? null,
      },
    });
    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
