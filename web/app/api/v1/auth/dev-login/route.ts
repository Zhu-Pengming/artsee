import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 开发者测试账号配置
const DEV_PHONE = "13511679218";
const DEV_USER_DATA = {
  nickname: "开发管理员",
  avatar_url: null,
  role: "admin",
  status: "active",
  is_verified: true,
  user_type: "admin",
};

export async function POST(req: NextRequest) {
  try {
    // 检查是否为开发环境
    const isDev = process.env.NODE_ENV === "development";
    
    // 只允许开发环境或带上特殊header的请求
    const devSecret = req.headers.get("x-dev-secret");
    const isDevRequest = isDev || devSecret === "artsee_dev_2024";
    
    if (!isDevRequest) {
      return NextResponse.json(
        { error: "开发者登录仅在开发环境可用" },
        { status: 403 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const fullPhone = `+86${DEV_PHONE}`;

    // 检查是否已存在该手机号的用户
    const { data: existingLink } = await supabase
      .from("auth_provider_links")
      .select("user_id")
      .eq("provider", "phone")
      .eq("provider_user_id", fullPhone)
      .single();

    let userId: string;
    let isNewUser = false;

    if (existingLink) {
      // 已存在用户，更新为管理员角色
      userId = existingLink.user_id;
      
      // 更新用户资料为管理员
      await supabase
        .from("user_profiles")
        .update({
          ...DEV_USER_DATA,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
        
      console.log("✅ 开发者账号已更新为管理员:", userId);
    } else {
      // 创建新的管理员用户
      isNewUser = true;
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        phone: fullPhone,
        phone_confirm: true,
        user_metadata: {
          phone: DEV_PHONE,
          country_code: "+86",
          ...DEV_USER_DATA,
        },
      });

      if (createError || !newUser.user) {
        console.error("创建开发者用户失败:", createError);
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

      // 更新 user_profiles 为管理员
      await supabase
        .from("user_profiles")
        .update({
          phone: DEV_PHONE,
          country_code: "+86",
          ...DEV_USER_DATA,
          last_login_at: new Date().toISOString(),
        })
        .eq("id", userId);
        
      console.log("✅ 开发者管理员账号已创建:", userId);
    }

    // 获取用户资料
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id, phone, nickname, avatar_url, role, status, is_verified, user_type, last_login_at, created_at")
      .eq("id", userId)
      .single();

    return NextResponse.json({
      success: true,
      isNewUser,
      isDevLogin: true,
      user: {
        id: userId,
        phone: DEV_PHONE,
        role: profile?.role || "admin",
        profile,
      },
      message: isNewUser ? "开发者管理员账号创建成功" : "开发者登录成功",
    });
  } catch (error: any) {
    console.error("开发者登录错误:", error);
    return NextResponse.json(
      { error: error.message || "服务器错误" },
      { status: 500 }
    );
  }
}
