import { NextRequest, NextResponse } from "next/server";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Row = Record<string, unknown>;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const keyword = searchParams.get("keyword")?.trim();
    const university = searchParams.get("university")?.trim();
    const major = searchParams.get("major")?.trim();

    let query = createServiceClient()
      .from("mentors")
      .select("*, services:mentor_services(*)", { count: "exact" })
      .eq("status", "active")
      .eq("verification_status", "verified")
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (keyword) query = query.ilike("display_name", `%${keyword}%`);
    if (university) query = query.ilike("university", `%${university}%`);
    if (major) query = query.ilike("major", `%${major}%`);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);
    const rows = (data ?? []).map((mentor) => ({
      ...mentor,
      services: Array.isArray(mentor.services)
        ? (mentor.services as Row[]).filter((service) => service.status === "active")
        : [],
    }));
    return NextResponse.json({
      success: true,
      data: rows,
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
