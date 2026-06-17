import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/api/notifications";
import { requireUser } from "@/lib/api/authz";
import {
  errorResponse,
  invalidIdResponse,
  notFoundResponse,
} from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
type Row = Record<string, unknown>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REVIEWABLE_STATUSES = new Set(["closed", "converted"]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
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

function isMissingReviewSchema(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "42703" ||
    err.code === "PGRST204" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes("consultation_reviews")) ||
    Boolean(err.message?.includes("schema cache"))
  );
}

function organizationIdFromConsultation(consultation: Row) {
  return (
    cleanText(consultation.assigned_to_org_id) ||
    cleanText(objectValue(consultation.metadata).organization_id)
  );
}

async function loadConsultation(
  supabase: ReturnType<typeof createServiceClient>,
  id: string,
  userId: string
) {
  return supabase
    .from("consultations")
    .select("id,user_id,assigned_to_org_id,status,target_name,metadata")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const supabase = createServiceClient();
    const { data: consultation, error: consultationError } = await loadConsultation(
      supabase,
      id,
      auth.user.id
    );
    if (consultationError) return errorResponse(consultationError);
    if (!consultation) return notFoundResponse();

    const { data, error } = await supabase
      .from("consultation_reviews")
      .select("*")
      .eq("consultation_id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (error) {
      if (isMissingReviewSchema(error)) {
        return NextResponse.json({
          success: true,
          data: null,
          organization_id: organizationIdFromConsultation(consultation as Row) || null,
          schema_ready: false,
        });
      }
      return errorResponse(error);
    }

    return NextResponse.json({
      success: true,
      data: data ?? null,
      organization_id: organizationIdFromConsultation(consultation as Row) || null,
      schema_ready: true,
    });
  } catch (e) {
    return errorResponse(e);
  }
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
    const { data: consultation, error: consultationError } = await loadConsultation(
      supabase,
      id,
      auth.user.id
    );
    if (consultationError) return errorResponse(consultationError);
    if (!consultation) return notFoundResponse();

    const consultationRow = consultation as Row;
    const organizationId = organizationIdFromConsultation(consultationRow);
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "该咨询未关联机构，无法评价机构" },
        { status: 400 }
      );
    }

    const consultationStatus = cleanText(consultationRow.status);
    if (!REVIEWABLE_STATUSES.has(consultationStatus)) {
      return NextResponse.json(
        { success: false, error: "咨询结束后才可以评价机构" },
        { status: 409 }
      );
    }

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .select("id,name,owner_user_id,status")
      .eq("id", organizationId)
      .maybeSingle();
    if (organizationError) return errorResponse(organizationError);
    if (!organization) return notFoundResponse();

    const { data: existing, error: existingError } = await supabase
      .from("consultation_reviews")
      .select("id")
      .eq("consultation_id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (existingError) {
      if (isMissingReviewSchema(existingError)) {
        return NextResponse.json(
          { success: false, error: "咨询评价表尚未迁移", schema_ready: false },
          { status: 503 }
        );
      }
      return errorResponse(existingError);
    }
    if (existing) {
      return NextResponse.json(
        { success: false, error: "该咨询已评价" },
        { status: 409 }
      );
    }

    const { data: review, error: reviewError } = await supabase
      .from("consultation_reviews")
      .insert({
        consultation_id: id,
        user_id: auth.user.id,
        organization_id: organizationId,
        rating,
        body: reviewBody || null,
        metadata: {
          target_name: cleanText(consultationRow.target_name) || null,
          consultation_status: consultationStatus,
        },
      })
      .select("*")
      .single();
    if (reviewError) return errorResponse(reviewError);

    const { data: reviewRows, error: aggregateError } = await supabase
      .from("consultation_reviews")
      .select("rating")
      .eq("organization_id", organizationId);
    if (aggregateError) return errorResponse(aggregateError);

    const reviews = (reviewRows ?? []) as Row[];
    const nextRating = averageRating(reviews);
    const { error: updateOrganizationError } = await supabase
      .from("organizations")
      .update({
        rating: nextRating,
        review_count: reviews.length,
      })
      .eq("id", organizationId)
      .select("id")
      .single();
    if (updateOrganizationError) return errorResponse(updateOrganizationError);

    await createNotification(supabase, cleanText((organization as Row).owner_user_id), {
      title: "你收到一条机构咨询评价",
      content: reviewBody || `${rating} 星评价`,
      type: "consultation_review",
      metadata: {
        consultation_id: id,
        organization_id: organizationId,
        consultation_review_id: (review as Row).id,
        rating,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: review,
        organization: {
          id: organizationId,
          rating: nextRating,
          review_count: reviews.length,
        },
        schema_ready: true,
      },
      { status: 201 }
    );
  } catch (e) {
    return errorResponse(e);
  }
}
