import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { phone, country_code = "+86", purpose = "login" } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: "手机号不能为空" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 开发模式：固定验证码为 123456
    // 生产模式：生成随机 6 位验证码
    const isDev = process.env.NODE_ENV === "development";
    const code = isDev ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();

    // 开发模式：删除该手机号的旧验证码，确保每次都是 123456
    if (isDev) {
      await supabase.from("sms_verifications").delete().eq("phone", phone);
    }

    // 保存到数据库
    const { error } = await supabase.from("sms_verifications").insert({
      phone,
      verification_code: code,
      purpose,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5分钟过期
      verified: false,
    });

    if (error) {
      console.error("保存验证码失败:", error);
      return NextResponse.json(
        { error: "发送验证码失败" },
        { status: 500 }
      );
    }

    // 模拟发送短信（实际项目中接入短信服务商）
    console.log(`📱 验证码已生成: ${phone} -> ${code}`);

    return NextResponse.json({
      success: true,
      message: "验证码已发送",
      // 开发环境返回验证码，生产环境不要返回
      code: isDev ? code : undefined,
    });
  } catch (error: any) {
    console.error("发送验证码错误:", error);
    return NextResponse.json(
      { error: error.message || "服务器错误" },
      { status: 500 }
    );
  }
}
