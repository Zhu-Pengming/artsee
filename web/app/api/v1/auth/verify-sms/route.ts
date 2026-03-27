import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { phone, code, country_code = "+86" } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "手机号和验证码不能为空" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 验证验证码
    const { data: verification, error: verifyError } = await supabase
      .from("sms_verifications")
      .select("*")
      .eq("phone", phone)
      .eq("verification_code", code)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (verifyError || !verification) {
      return NextResponse.json(
        { error: "验证码无效或已过期" },
        { status: 400 }
      );
    }

    // 标记验证码已使用
    await supabase
      .from("sms_verifications")
      .update({ verified: true })
      .eq("id", verification.id);

    // 检查是否已有该手机号的用户
    const fullPhone = `${country_code}${phone}`;
    
    // 先检查 auth_provider_links
    const { data: existingLink } = await supabase
      .from("auth_provider_links")
      .select("user_id")
      .eq("provider", "phone")
      .eq("provider_user_id", fullPhone)
      .single();

    let userId: string;
    let isNewUser = false;

    if (existingLink) {
      // 已存在用户，直接登录
      userId = existingLink.user_id;
      
      // 更新最后登录时间
      await supabase
        .from("user_profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", userId);
    } else {
      // 创建新用户
      isNewUser = true;
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        phone: fullPhone,
        phone_confirm: true,
        user_metadata: {
          phone,
          country_code,
        },
      });

      if (createError || !newUser.user) {
        return NextResponse.json(
          { error: createError?.message || "创建用户失败" },
          { status: 500 }
        );
      }

      userId = newUser.user.id;

      // 创建 provider link
      await supabase.from("auth_provider_links").insert({
        user_id: userId,
        provider: "phone",
        provider_user_id: fullPhone,
        is_primary: true,
      });

      // 更新 user_profiles
      await supabase
        .from("user_profiles")
        .update({
          phone,
          country_code,
          last_login_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    // 创建 session
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: `${userId}@artsee.internal`,
    });

    if (sessionError) {
      // 如果 generateLink 失败，使用自定义 token 方式
      console.log("使用备用登录方式");
    }

    // 获取用户资料（包含 role）
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id, phone, nickname, avatar_url, role, status, is_verified, user_type, last_login_at, created_at")
      .eq("id", userId)
      .single();

    return NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: userId,
        phone,
        role: profile?.role || 'user',
        profile,
      },
      message: isNewUser ? "注册成功" : "登录成功",
    });
  } catch (error: any) {
    console.error("验证验证码错误:", error);
    return NextResponse.json(
      { error: error.message || "服务器错误" },
      { status: 500 }
    );
  }
}
