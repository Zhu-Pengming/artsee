import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import {
  canAccessWorkbenchConsultation,
  requireWorkbenchUser,
} from "@/lib/api/workbench-access";
import { attachConsultationUnreadCounts } from "@/lib/api/consultation-unread";

const STATUSES = new Set(["new", "pending", "active", "closed", "converted"]);

function isMissingAssignmentColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "PGRST204" ||
    err.code === "42703" ||
    Boolean(err.message?.includes("assigned_to_user_id")) ||
    Boolean(err.message?.includes("schema cache"))
  );
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireWorkbenchUser(req);
    if ("response" in auth) return auth.response;

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status")?.trim();
    const supabase = createServiceClient();

    let query = supabase
      .from("consultations")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const visibilityFilters = [`assigned_to_user_id.eq.${auth.user.id}`];
    if (auth.organizationIds.length > 0) {
      visibilityFilters.push(
        `assigned_to_org_id.in.(${auth.organizationIds.join(",")})`
      );
    }
    if (auth.canAccessPlatformPool) {
      visibilityFilters.push(
        "and(assigned_to_user_id.is.null,assigned_to_org_id.is.null)"
      );
    }
    query = query.or(visibilityFilters.join(","));

    if (status && STATUSES.has(status)) query = query.eq("status", status);

    const { data, error, count } = await query;
    if (error) {
      if (isMissingAssignmentColumn(error)) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          pagination: { limit, offset },
          schema_ready: false,
        });
      }
      return errorResponse(error);
    }

    const visibleData = (data ?? []).filter((row) =>
      canAccessWorkbenchConsultation(
        row,
        auth.user.id,
        auth.canAccessPlatformPool,
        auth.organizationIds,
        auth.memberships
      )
    );

    const rows = await attachConsultationUnreadCounts(
      supabase,
      visibleData,
      "handler"
    );

    return NextResponse.json({
      success: true,
      data: rows,
      count: visibleData.length,
      pagination: { limit, offset },
      prefiltered_count: count,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
