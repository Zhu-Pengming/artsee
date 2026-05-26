import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 20);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const body = await req.json();
    const requestedUserId = typeof body.userId === "string" ? body.userId : user.id;
    if (requestedUserId !== user.id) {
      return NextResponse.json({ success: false, error: "不能替其他用户完成引导" }, { status: 403 });
    }

    const interestedCategories = toStringArray(body.interestedCategories ?? body.interested_categories);
    const now = new Date().toISOString();
    const profileCompletionScore = interestedCategories.length >= 2 ? 35 : 20;

    const supabase = createServiceClient();
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: user.id,
          interested_categories: interestedCategories,
          has_completed_onboarding: true,
          profile_completion_score: profileCompletionScore,
          onboarding_completed_at: now,
          updated_at: now,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg || "服务器错误" }, { status: 500 });
  }
}
