import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/api/notifications";
import { requireUser } from "@/lib/api/authz";
import { errorResponse, invalidIdResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
type Row = Record<string, unknown>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseRating(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : 0;
}

function averageRating(rows: Row[]) {
  if (rows.length === 0) return 0;
  const total = rows.reduce((sum, row) => {
    const rating = Number(row.rating);
    return sum + (Number.isFinite(rating) ? rating : 0);
  }, 0);
  return Number((total / rows.length).toFixed(2));
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const body = (await req.json().catch(() => ({}))) as Row;
    const rating = parseRating(body.rating);
    const reviewBody = cleanText(body.body ?? body.content ?? body.review);
    if (!rating) {
      return NextResponse.json(
        { success: false, error: "请提交 1 到 5 分的有效评分" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: booking, error: bookingError } = await supabase
      .from("mentor_bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (bookingError) return errorResponse(bookingError);
    if (!booking) return notFoundResponse();
    if (booking.student_user_id !== auth.user.id) return notFoundResponse();
    if (booking.status !== "completed") {
      return NextResponse.json(
        { success: false, error: "服务完成后才可以评价导师" },
        { status: 409 }
      );
    }

    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("*")
      .eq("id", booking.mentor_id)
      .maybeSingle();

    if (mentorError) return errorResponse(mentorError);
    if (!mentor) return notFoundResponse();

    const { data: existing, error: existingError } = await supabase
      .from("mentor_reviews")
      .select("id")
      .eq("booking_id", id)
      .maybeSingle();

    if (existingError) return errorResponse(existingError);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "该预约已评价" },
        { status: 409 }
      );
    }

    const { data: review, error: reviewError } = await supabase
      .from("mentor_reviews")
      .insert({
        mentor_id: booking.mentor_id,
        booking_id: id,
        student_user_id: auth.user.id,
        rating,
        body: reviewBody || null,
        metadata: {
          mentor_service_id: booking.mentor_service_id ?? null,
        },
      })
      .select("*")
      .single();

    if (reviewError) return errorResponse(reviewError);

    const { data: reviewRows, error: aggregateError } = await supabase
      .from("mentor_reviews")
      .select("rating")
      .eq("mentor_id", booking.mentor_id);
    if (aggregateError) return errorResponse(aggregateError);

    const reviews = reviewRows ?? [];
    const nextRating = averageRating(reviews);
    const { error: updateMentorError } = await supabase
      .from("mentors")
      .update({
        rating: nextRating,
        review_count: reviews.length,
      })
      .eq("id", booking.mentor_id)
      .select("id")
      .single();
    if (updateMentorError) return errorResponse(updateMentorError);

    await createNotification(supabase, cleanText(mentor.user_id), {
      title: "你收到一条导师评价",
      content: reviewBody || `${rating} 星评价`,
      type: "mentor_review",
      metadata: {
        mentor_id: booking.mentor_id,
        mentor_booking_id: id,
        mentor_review_id: review.id,
        rating,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: review,
        mentor: {
          id: booking.mentor_id,
          rating: nextRating,
          review_count: reviews.length,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    return errorResponse(e);
  }
}
