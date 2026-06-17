import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/api/notifications";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ type: string; id: string }> };
type ContentType = "events" | "opportunities" | "artworks" | "artists";
type ContentRow = Record<string, unknown>;

const TYPE_CONFIG: Record<
  ContentType,
  {
    table: string;
    titleField: string;
    ownerField: string;
    rejectedStatus: "rejected" | "archived";
  }
> = {
  events: {
    table: "events",
    titleField: "title",
    ownerField: "created_by",
    rejectedStatus: "archived",
  },
  opportunities: {
    table: "opportunities",
    titleField: "title",
    ownerField: "created_by",
    rejectedStatus: "archived",
  },
  artworks: {
    table: "artworks",
    titleField: "title",
    ownerField: "user_id",
    rejectedStatus: "rejected",
  },
  artists: {
    table: "artist_profiles",
    titleField: "display_name",
    ownerField: "user_id",
    rejectedStatus: "rejected",
  },
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { type: rawType, id } = await ctx.params;
    const type = rawType as ContentType;
    const config = TYPE_CONFIG[type];
    if (!config) {
      return NextResponse.json({ success: false, error: "无效内容类型" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const decision = cleanText(body.status || body.decision);
    if (!["approved", "rejected"].includes(decision)) {
      return NextResponse.json(
        { success: false, error: "status 必须是 approved 或 rejected" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: current, error: readError } = await supabase
      .from(config.table)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (readError) return errorResponse(readError);
    if (!current) return notFoundResponse();

    const now = new Date().toISOString();
    const nextStatus = decision === "approved" ? "published" : config.rejectedStatus;
    const review = {
      decision,
      reviewed_by_user_id: admin.user.id,
      reviewed_at: now,
      review_note: cleanText(body.review_note) || null,
    };

    const { data, error } = await supabase
      .from(config.table)
      .update({
        status: nextStatus,
        metadata: {
          ...objectValue((current as ContentRow).metadata),
          review,
        },
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return errorResponse(error);

    const ownerUserId = stringValue((data as ContentRow)[config.ownerField]);
    await createNotification(supabase, ownerUserId, {
      title: decision === "approved" ? "内容审核已通过" : "内容审核未通过",
      content: cleanText(body.review_note) || stringValue((data as ContentRow)[config.titleField]) || null,
      type: "content_review",
      metadata: {
        content_type: type,
        content_id: id,
        decision,
        status: nextStatus,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
