import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function positiveInt(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function nonNegativeInt(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : -1;
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
    const supabase = createServiceClient();
    const { data: mentor, error: mentorError } = await getOwnMentor(
      supabase,
      auth.user.id
    );
    if (mentorError) return errorResponse(mentorError);
    if (!mentor) {
      return NextResponse.json({ success: true, data: [], count: 0, pagination: { limit, offset } });
    }

    const { data, error, count } = await supabase
      .from("mentor_services")
      .select("*", { count: "exact" })
      .eq("mentor_id", mentor.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

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
    const title = cleanText(body.title);
    const durationMinutes = positiveInt(body.duration_minutes ?? body.durationMinutes);
    const priceAmount = nonNegativeInt(body.price_amount ?? body.priceAmount);
    if (!title || !durationMinutes || priceAmount < 0) {
      return NextResponse.json(
        { success: false, error: "请填写有效服务标题、时长和价格" },
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
      .from("mentor_services")
      .insert({
        mentor_id: mentor.id,
        title,
        description: cleanText(body.description) || null,
        service_type: cleanText(body.service_type ?? body.serviceType) || "portfolio_review",
        duration_minutes: durationMinutes,
        price_amount: priceAmount,
        currency: (cleanText(body.currency) || "cny").toLowerCase(),
        status: cleanText(body.status) || "active",
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
