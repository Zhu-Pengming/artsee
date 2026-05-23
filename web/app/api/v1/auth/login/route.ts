import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.user) {
      console.error("登录失败:", signInError);
      return NextResponse.json(
        { message: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    const userId = signInData.user.id;
    const token = signInData.session?.access_token || "";

    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabaseService
      .from("user_profiles")
      .update({
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    const { data: profile } = await supabaseService
      .from("user_profiles")
      .select("nickname")
      .eq("id", userId)
      .single();

    return NextResponse.json({
      token,
      user: {
        id: userId,
        email: signInData.user.email,
        username: profile?.nickname || signInData.user.user_metadata?.username || "",
      },
    });
  } catch (error: any) {
    console.error("登录错误:", error);
    return NextResponse.json(
      { message: error.message || "服务器错误" },
      { status: 500 }
    );
  }
}
