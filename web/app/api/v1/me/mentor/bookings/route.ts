import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Row = Record<string, unknown>;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function rowId(row: Row) {
  return typeof row.id === "string" ? row.id : "";
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

async function enrichBookings(
  supabase: ReturnType<typeof createServiceClient>,
  rows: Row[]
) {
  const mentorIds = Array.from(
    new Set(rows.map((row) => cleanText(row.mentor_id)).filter(Boolean))
  );
  const serviceIds = Array.from(
    new Set(rows.map((row) => cleanText(row.mentor_service_id)).filter(Boolean))
  );
  const orderIds = Array.from(
    new Set(rows.map((row) => cleanText(row.order_id)).filter(Boolean))
  );

  const mentorsById = new Map<string, Row>();
  const servicesById = new Map<string, Row>();
  const reviewsByBookingId = new Map<string, Row>();
  const ordersById = new Map<string, Row>();

  if (mentorIds.length > 0) {
    const { data } = await supabase
      .from("mentors")
      .select("*")
      .in("id", mentorIds);
    for (const mentor of data ?? []) mentorsById.set(rowId(mentor), mentor);
  }

  if (serviceIds.length > 0) {
    const { data } = await supabase
      .from("mentor_services")
      .select("*")
      .in("id", serviceIds);
    for (const service of data ?? []) servicesById.set(rowId(service), service);
  }

  if (rows.length > 0) {
    const { data } = await supabase
      .from("mentor_reviews")
      .select("*")
      .in("booking_id", rows.map(rowId).filter(Boolean));
    for (const review of data ?? []) {
      const bookingId =
        typeof review.booking_id === "string" ? review.booking_id : "";
      if (bookingId) reviewsByBookingId.set(bookingId, review);
    }
  }

  if (orderIds.length > 0) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .in("id", orderIds);
    for (const order of data ?? []) ordersById.set(rowId(order), order);
  }

  return rows.map((row) => ({
    ...row,
    mentor: mentorsById.get(cleanText(row.mentor_id)) ?? null,
    service: servicesById.get(cleanText(row.mentor_service_id)) ?? null,
    review: reviewsByBookingId.get(rowId(row)) ?? null,
    order: ordersById.get(cleanText(row.order_id)) ?? null,
  }));
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") ?? "all";
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();

    const { data: mentor, error: mentorError } = await getOwnMentor(
      supabase,
      auth.user.id
    );
    if (mentorError) return errorResponse(mentorError);

    const rows: Row[] = [];
    if (role !== "mentor") {
      const { data, error } = await supabase
        .from("mentor_bookings")
        .select("*")
        .eq("student_user_id", auth.user.id)
        .order("created_at", { ascending: false });
      if (error) return errorResponse(error);
      rows.push(...(data ?? []));
    }

    if (role !== "student" && mentor?.id) {
      const { data, error } = await supabase
        .from("mentor_bookings")
        .select("*")
        .eq("mentor_id", mentor.id)
        .order("created_at", { ascending: false });
      if (error) return errorResponse(error);
      rows.push(...(data ?? []));
    }

    const deduped = Array.from(
      new Map(rows.map((row) => [rowId(row), row])).values()
    ).sort((a, b) => {
      const left = Date.parse(cleanText(a.created_at));
      const right = Date.parse(cleanText(b.created_at));
      return (Number.isFinite(right) ? right : 0) - (Number.isFinite(left) ? left : 0);
    });
    const paged = deduped.slice(offset, offset + limit);
    const enriched = await enrichBookings(supabase, paged);

    return NextResponse.json({
      success: true,
      data: enriched,
      count: deduped.length,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
