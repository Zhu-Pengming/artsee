import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeNickname(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    const nickname = normalizeNickname(body.nickname ?? body.username);

    if (!email || !password || !nickname) {
      return NextResponse.json(
        { success: false, error: "邮箱、密码和昵称不能为空" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "密码至少需要 6 位" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: nickname, nickname },
    });

    if (signUpError) {
      const isDuplicate = signUpError.message.toLowerCase().includes("already");
      return NextResponse.json(
        { success: false, error: isDuplicate ? "邮箱已被注册" : signUpError.message },
        { status: isDuplicate ? 409 : 400 }
      );
    }
    if (!authData.user) {
      return NextResponse.json({ success: false, error: "创建用户失败" }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: authData.user.id,
          nickname,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select("*")
      .maybeSingle();

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      return NextResponse.json(
        {
          success: true,
          data: {
            token: "",
            user: {
              id: authData.user.id,
              email: authData.user.email,
              username: nickname,
              nickname,
              role: "user",
              profile,
            },
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          token: signInData.session.access_token,
          user: {
            id: authData.user.id,
            email: authData.user.email,
            username: nickname,
            nickname,
            role: "user",
            profile,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg || "服务器错误" }, { status: 500 });
  }
}
