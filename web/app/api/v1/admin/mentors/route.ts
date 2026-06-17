import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

const VERIFICATION_STATUSES = new Set(["pending", "verified", "rejected"]);
const MENTOR_STATUSES = new Set(["draft", "active", "rejected", "suspended"]);

function cleanText(value: string | null) {
  return value?.trim() ?? "";
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("response" in admin) return admin.response;

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const verificationStatus = cleanText(searchParams.get("verification_status"));
    const status = cleanText(searchParams.get("status"));
    const keyword = cleanText(searchParams.get("keyword"));
    const supabase = createServiceClient();

    let query = supabase
      .from("mentors")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (verificationStatus && verificationStatus !== "all") {
      if (!VERIFICATION_STATUSES.has(verificationStatus)) {
        return NextResponse.json(
          { success: false, error: "无效导师认证状态" },
          { status: 400 }
        );
      }
      query = query.eq("verification_status", verificationStatus);
    }

    if (status && status !== "all") {
      if (!MENTOR_STATUSES.has(status)) {
        return NextResponse.json(
          { success: false, error: "无效导师状态" },
          { status: 400 }
        );
      }
      query = query.eq("status", status);
    }

    if (keyword) {
      query = query.ilike("display_name", `%${keyword}%`);
    }

    const { data, error, count } = await query;
    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data: data ?? [],
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
