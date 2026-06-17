import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, invalidIdResponse, notFoundResponse } from "@/lib/api/route-helpers";
import {
  canAccessWorkbenchAssignment,
  requireWorkbenchUser,
} from "@/lib/api/workbench-access";
import { createNotification } from "@/lib/api/notifications";

type Ctx = { params: Promise<{ id: string }> };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(["requested", "confirmed", "scheduled", "completed", "canceled"]);
const STATUS_LABELS: Record<string, string> = {
  requested: "待确认",
  confirmed: "已确认",
  scheduled: "已排期",
  completed: "已完成",
  canceled: "已取消",
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNullableText(value: unknown) {
  if (value === null) return null;
  const text = cleanText(value);
  return text || undefined;
}

function isMissingServiceBookingsTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes("service_bookings"))
  );
}

async function getBooking(
  supabase: ReturnType<typeof createServiceClient>,
  id: string
) {
  return supabase
    .from("service_bookings")
    .select("*, consultation:consultations(*)")
    .eq("id", id)
    .maybeSingle();
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const supabase = createServiceClient();
    const { data, error } = await getBooking(supabase, id);
    if (error) {
      if (isMissingServiceBookingsTable(error)) return notFoundResponse();
      return errorResponse(error);
    }
    if (!data) return notFoundResponse();
    if (
      !canAccessWorkbenchAssignment(
        data,
        auth.user.id,
        auth.canAccessPlatformPool,
        auth.organizationIds,
        auth.memberships
      )
    ) {
      return notFoundResponse();
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const body = (await req.json().catch(() => ({}))) as {
      status?: unknown;
      scheduled_at?: unknown;
      notes?: unknown;
    };

    const supabase = createServiceClient();
    const { data: existing, error: existingError } = await getBooking(supabase, id);
    if (existingError) {
      if (isMissingServiceBookingsTable(existingError)) return notFoundResponse();
      return errorResponse(existingError);
    }
    if (!existing) return notFoundResponse();
    if (
      !canAccessWorkbenchAssignment(
        existing,
        auth.user.id,
        auth.canAccessPlatformPool,
        auth.organizationIds,
        auth.memberships
      )
    ) {
      return notFoundResponse();
    }

    const patch: Record<string, unknown> = {};
    const status = cleanText(body.status);
    if (status) {
      if (!STATUSES.has(status)) {
        return NextResponse.json({ success: false, error: "无效预约状态" }, { status: 400 });
      }
      patch.status = status;
    }

    const scheduledAt = cleanNullableText(body.scheduled_at);
    if (scheduledAt !== undefined) {
      if (scheduledAt === null) {
        patch.scheduled_at = null;
      } else {
        const parsed = Date.parse(scheduledAt);
        if (Number.isNaN(parsed)) {
          return NextResponse.json({ success: false, error: "无效预约时间" }, { status: 400 });
        }
        patch.scheduled_at = new Date(parsed).toISOString();
      }
    }

    const notes = cleanNullableText(body.notes);
    if (notes !== undefined) patch.notes = notes;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: "缺少可更新字段" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("service_bookings")
      .update(patch)
      .eq("id", id)
      .select("*, consultation:consultations(*)")
      .single();

    if (error) return errorResponse(error);
    if (status && status !== existing.status) {
      const consultation = data.consultation as Record<string, unknown> | null;
      await createNotification(supabase, data.student_user_id?.toString(), {
        title: `${data.title ?? "预约服务"}${STATUS_LABELS[status] ?? "已更新"}`,
        content: data.notes?.toString() ?? null,
        type: "service_booking",
        metadata: {
          service_booking_id: data.id,
          consultation_id: data.consultation_id,
          target_name: consultation?.target_name ?? null,
          status,
        },
      });
    }
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
