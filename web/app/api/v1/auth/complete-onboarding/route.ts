import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { userId, interestedCategories } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "用户ID不能为空" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update user profile to mark onboarding as complete
    const { data: profile, error: updateError } = await supabase
      .from("user_profiles")
      .update({
        interested_categories: interestedCategories || [],
        has_completed_onboarding: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("id, nickname, interested_categories, has_completed_onboarding")
      .single();

    if (updateError) {
      console.error("完成 onboarding 失败:", updateError);
      return NextResponse.json(
        { error: updateError.message || "更新失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "onboarding 完成",
      profile,
    });
  } catch (error: any) {
    console.error("完成 onboarding 错误:", error);
    return NextResponse.json(
      { error: error.message || "服务器错误" },
      { status: 500 }
    );
  }
}
