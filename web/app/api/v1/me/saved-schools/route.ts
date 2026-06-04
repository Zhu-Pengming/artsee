import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

function normalizeSavedSchool(row: Record<string, unknown>) {
  const rawSchool = row.schools;
  const school = Array.isArray(rawSchool) ? rawSchool[0] : rawSchool;
  return {
    ...((school as Record<string, unknown> | null) ?? {}),
    school_id: row.school_id,
    saved_school_id: row.id,
    saved_at: row.saved_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "未授权" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();
    const { data, error, count } = await supabase
      .from("saved_schools")
      .select("id, school_id, saved_at, schools(*)", { count: "exact" })
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data: (data ?? []).map((row) =>
        normalizeSavedSchool(row as Record<string, unknown>)
      ),
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "未授权" },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      school_id?: string;
    };
    const schoolId = body.school_id?.trim();
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "school_id 必填" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("saved_schools")
      .upsert(
        { user_id: user.id, school_id: schoolId, saved_at: new Date().toISOString() },
        { onConflict: "user_id,school_id" }
      )
      .select("id, school_id, saved_at, schools(*)")
      .single();

    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data: normalizeSavedSchool(data as Record<string, unknown>),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
