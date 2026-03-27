import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { userId, nickname, interestedCategories } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "用户ID不能为空" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 构建更新数据
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (nickname) {
      updateData.nickname = nickname;
    }

    if (interestedCategories && Array.isArray(interestedCategories)) {
      updateData.interested_categories = interestedCategories;
    }

    // 标记已完成引导
    updateData.has_completed_onboarding = true;

    // 更新用户资料
    const { data: profile, error: updateError } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", userId)
      .select("id, phone, nickname, avatar_url, role, status, is_verified, user_type, interested_categories, has_completed_onboarding, last_login_at, created_at")
      .single();

    if (updateError) {
      console.error("更新用户资料失败:", updateError);
      return NextResponse.json(
        { error: updateError.message || "更新失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "用户资料更新成功",
      profile,
    });
  } catch (error: any) {
    console.error("更新用户资料错误:", error);
    return NextResponse.json(
      { error: error.message || "服务器错误" },
      { status: 500 }
    );
 }
}
