import { createClient } from "@supabase/supabase-js";

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeOtp(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, "") : "";
}

export function createPublicAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("缺少 Supabase Auth 配置: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function sendSupabaseEmailOtp(input: {
  email: string;
  nickname?: string;
}) {
  const email = normalizeEmail(input.email);
  if (!email) return { ok: false, error: "请填写有效邮箱" };

  const nickname = typeof input.nickname === "string" ? input.nickname.trim() : "";
  const supabase = createPublicAuthClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: nickname ? { nickname, username: nickname } : undefined,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function verifySupabaseEmailOtp(input: {
  email: string;
  code: string;
}) {
  const email = normalizeEmail(input.email);
  const token = normalizeOtp(input.code);
  if (!email || !token) return { ok: false, error: "邮箱验证码不能为空" };

  const supabase = createPublicAuthClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { ok: false, error: error.message || "邮箱验证码无效或已过期" };
  }

  return { ok: true, user: data.user, session: data.session };
}
