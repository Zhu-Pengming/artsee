import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import {
  isAdminProfile,
  requireBusinessPublisher,
} from "@/lib/api/authz";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

const OPPORTUNITY_STATUSES = new Set(["draft", "reviewing", "published", "closed", "archived"]);

function opportunityStatusForCreate(raw: unknown, admin: boolean) {
  const status = typeof raw === "string" ? raw.trim() : "";
  if (admin) return OPPORTUNITY_STATUSES.has(status) ? status : "published";
  return status === "draft" ? "draft" : "reviewing";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const includeInactive = searchParams.get("include_inactive") === "true";
    if (includeInactive) {
      const auth = await requireAdmin(req);
      if ("response" in auth) return auth.response;
    }
    let query = createServiceClient()
      .from("opportunities")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (!includeInactive) query = query.eq("status", "published");
    const type = searchParams.get("type");
    const city = searchParams.get("city");
    const keyword = searchParams.get("keyword")?.trim();
    if (type) query = query.eq("type", type);
    if (city) query = query.eq("city", city);
    if (keyword) query = query.ilike("title", `%${keyword}%`);
    const { data, error, count } = await query;
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data, count, pagination: { limit, offset } });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireBusinessPublisher(req);
  if ("response" in auth) return auth.response;
  try {
    const body = await req.json();
    const { data, error } = await createServiceClient()
      .from("opportunities")
      .insert({
        ...body,
        status: opportunityStatusForCreate(
          body.status,
          isAdminProfile(auth.profile)
        ),
        created_by: auth.user.id,
      })
      .select()
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
