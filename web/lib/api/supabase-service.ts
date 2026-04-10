import { createClient } from "@supabase/supabase-js";

/** 服务端 API 路由使用 service role 访问数据库（仅在已校验用户身份或公开读场景使用） */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
