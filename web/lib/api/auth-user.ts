import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

/**
 * 从 Authorization: Bearer <access_token> 解析当前用户（使用 anon + JWT，不暴露 service role）
 */
export async function getUserFromBearer(
  req: NextRequest
): Promise<User | null> {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  const jwt = h.slice(7).trim();
  if (!jwt) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(jwt);
  if (error || !user) return null;
  return user;
}
