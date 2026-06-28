import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";
import {
  normalizeEmail,
  sendSupabaseEmailOtp,
} from "@/app/api/v1/auth/email-otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body.email);
    const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
    const purpose = typeof body.purpose === "string" ? body.purpose.trim() || "signup" : "signup";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "请填写有效邮箱" },
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
    if (existing?.email_confirmed_at && purpose === "signup") {
      return NextResponse.json(
        { success: false, error: "邮箱已被注册" },
        { status: 409 }
      );
    }

    const sent = await sendSupabaseEmailOtp({
      email,
      nickname,
    });
    if (!sent.ok) {
      return NextResponse.json(
        { success: false, error: sent.error || "发送邮箱验证码失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "邮箱验证码已发送",
      expires_in: 600,
      provider: "supabase_auth",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message || "服务器错误" },
      { status: 500 }
    );
  }
}
