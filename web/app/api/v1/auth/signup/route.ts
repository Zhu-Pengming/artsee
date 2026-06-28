import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";
import {
  normalizeEmail,
  normalizeOtp,
  verifySupabaseEmailOtp,
} from "@/app/api/v1/auth/email-otp";

function normalizeNickname(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    const nickname = normalizeNickname(body.nickname ?? body.username);
    const emailOtp = normalizeOtp(body.email_otp ?? body.emailOtp ?? body.otp);

    if (!email || !password || !nickname) {
      return NextResponse.json(
        { success: false, error: "邮箱、密码和昵称不能为空" },
        { status: 400 }
      );
    }
    if (!emailOtp) {
      return NextResponse.json(
        { success: false, error: "请填写邮箱验证码" },
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
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json(
        { success: false, error: listError.message },
        { status: 500 }
      );
    }
    const existing = users.users.find(
      (user) => user.email?.trim().toLowerCase() === email
    );
    if (existing?.email_confirmed_at) {
      return NextResponse.json(
        { success: false, error: "邮箱已被注册" },
        { status: 409 }
      );
    }

    const otp = await verifySupabaseEmailOtp({
      email,
      code: emailOtp,
    });
    if (!otp.ok) {
      return NextResponse.json(
        { success: false, error: otp.error },
        { status: 400 }
      );
    }
    if (!otp.user) {
      return NextResponse.json(
        { success: false, error: "邮箱验证码验证成功，但未返回用户" },
        { status: 500 }
      );
    }

    const { data: authData, error: updateError } = await supabase.auth.admin.updateUserById(otp.user.id, {
      password,
      email_confirm: true,
      user_metadata: { username: nickname, nickname },
    });

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 400 }
      );
    }
    const authUser = authData.user ?? otp.user;
    if (!authUser) {
      return NextResponse.json({ success: false, error: "创建用户失败" }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: authUser.id,
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
      const user = {
        id: authUser.id,
        email: authUser.email,
        username: nickname,
        nickname,
        role: "user",
        profile,
      };
      return NextResponse.json(
        {
          success: true,
          data: {
            token: "",
            session: null,
            user,
            profile,
          },
          token: "",
          session: null,
          user,
        },
        { status: 200 }
      );
    }

    const user = {
      id: authUser.id,
      email: authUser.email,
      username: nickname,
      nickname,
      role: "user",
      profile,
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          token: signInData.session.access_token,
          session: signInData.session,
          user,
          profile,
        },
        token: signInData.session.access_token,
        session: signInData.session,
        user,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg || "服务器错误" }, { status: 500 });
  }
}
