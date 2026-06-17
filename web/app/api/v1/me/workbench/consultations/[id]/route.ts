import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, invalidIdResponse, notFoundResponse } from "@/lib/api/route-helpers";
import {
  canAccessWorkbenchConsultation,
  requireWorkbenchUser,
} from "@/lib/api/workbench-access";
import { createNotification } from "@/lib/api/notifications";

type Ctx = { params: Promise<{ id: string }> };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(["new", "pending", "active", "closed", "converted"]);
const VALID_CURRENCY_RE = /^[a-z]{3}$/;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
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

function isMissingServiceBookingsTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes("service_bookings"))
  );
}

function isMissingAssignedAdvisorsColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "PGRST204" ||
    err.code === "42703" ||
    Boolean(err.message?.includes("assigned_advisors")) ||
    Boolean(err.message?.includes("schema cache"))
  );
}

function isMissingOrdersTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes("orders"))
  );
}

async function upsertServiceBooking(
  supabase: ReturnType<typeof createServiceClient>,
  consultation: Record<string, unknown>,
  handlerUserId: string,
  convertedAt: string
) {
  const consultationId = consultation.id?.toString();
  const studentUserId = consultation.user_id?.toString();
  if (!consultationId || !studentUserId) return { booking: null, error: null };

  const targetName = consultation.target_name?.toString() || "申请咨询";
  const assignedToOrgId =
    typeof consultation.assigned_to_org_id === "string"
      ? consultation.assigned_to_org_id
      : null;
  const assignedToUserId =
    typeof consultation.assigned_to_user_id === "string"
      ? consultation.assigned_to_user_id
      : handlerUserId;
  const metadata = objectMetadata(consultation.metadata);
  const assignedMemberId =
    typeof consultation.assigned_to_member_id === "string"
      ? consultation.assigned_to_member_id
      : null;
  const assignedAdvisors = assignedToUserId
    ? [
        {
          user_id: assignedToUserId,
          member_id: assignedMemberId,
          role: "primary",
        },
      ]
    : [];
  const existing = await supabase
    .from("service_bookings")
    .select("*")
    .eq("consultation_id", consultationId)
    .maybeSingle();
  if (existing.error) {
    if (isMissingServiceBookingsTable(existing.error)) {
      return { booking: null, error: null };
    }
    return { booking: null, error: existing.error };
  }
  if (existing.data) return { booking: existing.data, error: null };

  const insertRow = {
    consultation_id: consultationId,
    student_user_id: studentUserId,
    assigned_to_user_id: assignedToUserId,
    assigned_to_org_id: assignedToOrgId,
    assigned_advisors: assignedAdvisors,
    title: `${targetName}预约服务`,
    service_type: "consultation_followup",
    status: "requested",
    metadata: {
      consultation_target_type: consultation.target_type ?? null,
      consultation_topic: consultation.topic ?? null,
      consultation_metadata: metadata,
      converted_by_user_id: handlerUserId,
      converted_at: convertedAt,
    },
  };
  let { data, error } = await supabase
    .from("service_bookings")
    .insert(insertRow)
    .select("*")
    .single();

  if (error && isMissingAssignedAdvisorsColumn(error)) {
    const fallbackRow: Record<string, unknown> = { ...insertRow };
    delete fallbackRow.assigned_advisors;
    const fallback = await supabase
      .from("service_bookings")
      .insert(fallbackRow)
      .select("*")
      .single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error && isMissingServiceBookingsTable(error)) {
    return { booking: null, error: null };
  }
  return { booking: data ?? null, error };
}

async function upsertConsultationOrder(
  supabase: ReturnType<typeof createServiceClient>,
  consultation: Record<string, unknown>,
  handlerUserId: string,
  convertedAt: string,
  amountTotal: number,
  subject: string,
  currency: string
) {
  const consultationId = consultation.id?.toString();
  const studentUserId = consultation.user_id?.toString();
  if (!consultationId || !studentUserId) return { order: null, error: null };

  const existing = await supabase
    .from("orders")
    .select("*")
    .eq("item_type", "consultation")
    .eq("item_id", consultationId)
    .limit(1)
    .maybeSingle();
  if (existing.error) {
    if (isMissingOrdersTable(existing.error)) {
      return { order: null, error: null };
    }
    return { order: null, error: existing.error };
  }
  if (existing.data) return { order: existing.data, error: null };

  const metadata = objectMetadata(consultation.metadata);
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: studentUserId,
      order_no: makeOrderNo(),
      subject,
      item_type: "consultation",
      item_id: consultationId,
      amount_total: amountTotal,
      currency,
      status: "pending",
      provider: "internal",
      metadata: {
        consultation_id: consultationId,
        consultation_target_type: consultation.target_type ?? null,
        consultation_topic: consultation.topic ?? null,
        consultation_metadata: metadata,
        converted_by_user_id: handlerUserId,
        converted_at: convertedAt,
      },
    })
    .select("*")
    .single();

  if (error && isMissingOrdersTable(error)) {
    return { order: null, error: null };
  }
  return { order: data ?? null, error };
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return errorResponse(error);
    if (!data) return notFoundResponse();
    if (
      !canAccessWorkbenchConsultation(
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
      action?: unknown;
      amount_total?: unknown;
      order_amount_total?: unknown;
      subject?: unknown;
      order_subject?: unknown;
      currency?: unknown;
    };
    const action = cleanText(body.action);
    const requestedStatus = cleanText(body.status);
    const supabase = createServiceClient();

    const { data: consultation, error: consultationError } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (consultationError) return errorResponse(consultationError);
    if (!consultation) return notFoundResponse();
    if (
      !canAccessWorkbenchConsultation(
        consultation,
        auth.user.id,
        auth.canAccessPlatformPool,
        auth.organizationIds,
        auth.memberships
      )
    ) {
      return notFoundResponse();
    }

    const metadata = objectMetadata(consultation.metadata);
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      updated_at: now,
    };
    let notification:
      | {
          title: string;
          content?: string | null;
          type: string;
          metadata: Record<string, unknown>;
        }
      | null = null;

    if (action === "convert_to_booking" || action === "convert_to_order") {
      let booking: Record<string, unknown> | null = null;
      let order: Record<string, unknown> | null = null;
      if (action === "convert_to_booking") {
        const result = await upsertServiceBooking(
          supabase,
          consultation,
          auth.user.id,
          now
        );
        if (result.error) return errorResponse(result.error);
        booking = result.booking;
      }
      if (action === "convert_to_order") {
        const amountTotal = positiveInt(body.order_amount_total ?? body.amount_total);
        if (!amountTotal) {
          return NextResponse.json(
            { success: false, error: "转订单需要填写有效金额" },
            { status: 400 }
          );
        }
        const currency = (cleanText(body.currency) || "cny").toLowerCase();
        if (!VALID_CURRENCY_RE.test(currency)) {
          return NextResponse.json(
            { success: false, error: "币种格式无效" },
            { status: 400 }
          );
        }
        const targetName = consultation.target_name?.toString() || "申请咨询";
        const subject =
          cleanText(body.order_subject ?? body.subject) ||
          `${targetName}申请服务订单`;
        const result = await upsertConsultationOrder(
          supabase,
          consultation,
          auth.user.id,
          now,
          amountTotal,
          subject,
          currency
        );
        if (result.error) return errorResponse(result.error);
        order = result.order;
      }

      patch.status = "converted";
      patch.assigned_to_user_id = consultation.assigned_to_user_id ?? auth.user.id;
      patch.metadata = {
        ...metadata,
        conversion: {
          type: action === "convert_to_order" ? "order" : "service_booking",
          requested_by_user_id: auth.user.id,
          requested_at: now,
          status:
            action === "convert_to_order"
              ? order
                ? "created"
                : "placeholder"
              : booking
                ? "created"
                : "placeholder",
          service_booking_id: booking?.id ?? null,
          order_id: order?.id ?? null,
          order_no: order?.order_no ?? null,
          amount_total: order?.amount_total ?? null,
          currency: order?.currency ?? null,
        },
      };
      notification = {
        title:
          action === "convert_to_order"
            ? `${consultation.target_name ?? "咨询"}已生成待支付订单`
            : `${consultation.target_name ?? "咨询"}已转为预约服务`,
        content:
          action === "convert_to_order"
            ? order?.subject?.toString() ?? null
            : booking?.title?.toString() ?? null,
        type: action === "convert_to_order" ? "order" : "service_booking",
        metadata: {
          consultation_id: id,
          target_type: consultation.target_type ?? null,
          target_name: consultation.target_name ?? null,
          service_booking_id: booking?.id ?? null,
          order_id: order?.id ?? null,
          order_no: order?.order_no ?? null,
        },
      };
    } else if (requestedStatus && STATUSES.has(requestedStatus)) {
      patch.status = requestedStatus;
    } else {
      return NextResponse.json(
        { success: false, error: "缺少有效操作" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("consultations")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return errorResponse(error);
    if (notification) {
      await createNotification(
        supabase,
        consultation.user_id?.toString(),
        notification
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
