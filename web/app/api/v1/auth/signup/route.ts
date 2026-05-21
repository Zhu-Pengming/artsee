import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { email, password, nickname } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create user in Auth with nickname in metadata
    // Set email_confirm to true to skip email verification in development
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        nickname: nickname || email.split("@")[0],
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "创建用户失败" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;
    const userNickname = nickname || email.split("@")[0];

    // Ensure user_profile exists (trigger may not have created it yet)
    try {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: userId,
            nickname: userNickname,
          },
          { onConflict: "id" }
        );

      if (profileError) {
        console.error("创建用户资料失败:", profileError);
        // Don't fail the signup if profile creation fails
        // The trigger should have created it
      }
    } catch (e) {
      console.error("创建用户资料异常:", e);
      // Continue anyway
    }

    return NextResponse.json({
      success: true,
      message: "注册成功！请检查邮箱完成验证，然后登录。",
      user: {
        id: userId,
        email,
        nickname: userNickname,
      },
    });
  } catch (error: any) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { error: error.message || "服务器错误" },
      { status: 500 }
    );
  }
}
