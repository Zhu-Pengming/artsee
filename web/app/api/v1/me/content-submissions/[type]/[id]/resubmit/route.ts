import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ type: string; id: string }> };
type ContentType = "events" | "opportunities" | "artworks" | "artists";
type Row = Record<string, unknown>;

const TYPE_CONFIG: Record<
  ContentType,
  {
    table: string;
    ownerField: string;
  }
> = {
  events: {
    table: "events",
    ownerField: "created_by",
  },
  opportunities: {
    table: "opportunities",
    ownerField: "created_by",
  },
  artworks: {
    table: "artworks",
    ownerField: "user_id",
  },
  artists: {
    table: "artist_profiles",
    ownerField: "user_id",
  },
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const { type: rawType, id } = await ctx.params;
    const type = rawType as ContentType;
    const config = TYPE_CONFIG[type];
    if (!config) {
      return NextResponse.json({ success: false, error: "无效内容类型" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as Row;
    const supabase = createServiceClient();
    const { data: current, error: readError } = await supabase
      .from(config.table)
      .select("*")
      .eq("id", id)
      .eq(config.ownerField, auth.user.id)
      .maybeSingle();

    if (readError) return errorResponse(readError);
    if (!current) return notFoundResponse();

    const status = cleanText((current as Row).status);
    const metadata = objectValue((current as Row).metadata);
    const previousReview = objectValue(metadata.review);
    const previousDecision = cleanText(previousReview.decision);
    const canResubmit =
      status === "draft" ||
      status === "rejected" ||
      previousDecision === "rejected" ||
      (status === "archived" && previousDecision === "rejected");

    if (!canResubmit) {
      return NextResponse.json(
        { success: false, error: "当前内容状态不支持重新提交" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const reviewHistory = previousDecision
      ? [...arrayValue(metadata.review_history), previousReview]
      : arrayValue(metadata.review_history);

    const { data, error } = await supabase
      .from(config.table)
      .update({
        status: "reviewing",
        updated_at: now,
        metadata: {
          ...metadata,
          review_history: reviewHistory,
          review: {
            decision: "resubmitted",
            resubmitted_by_user_id: auth.user.id,
            resubmitted_at: now,
            resubmission_note: cleanText(body.note) || null,
          },
        },
      })
      .eq("id", id)
      .eq(config.ownerField, auth.user.id)
      .select("*")
      .single();
    if (error) return errorResponse(error);

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
