"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/**
 * 最小「运营/数据」入口：说明 BFF 地址、管理员所需条件、相关 API 与 Supabase 控制台。
 * 写操作仍通过 /api/v1/* + Bearer（requireAdmin）；本页不直接写库。
 */
export default function AdminHubPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user?.email) {
        setLoading(false);
        return;
      }
      setEmail(user.email);
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setRoleError(error.message);
        setLoading(false);
        return;
      }
      setIsAdmin(profile?.role === "admin");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-slate-600">
        加载中…
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="text-2xl font-bold text-slate-900">管理员后台</h1>
        <p className="text-slate-600 text-center max-w-md">请先使用 Supabase 账号登录后再访问。</p>
        <Link
          href="/auth/login?redirect=/admin"
          className="px-6 py-2.5 rounded-full bg-[#003399] text-white text-sm font-semibold"
        >
          去登录
        </Link>
      </div>
    );
  }

  if (roleError) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] p-8 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-slate-900 mb-4">管理员后台</h1>
        <p className="text-red-600 text-sm mb-4">无法读取 user_profiles：{roleError}</p>
        <p className="text-slate-600 text-sm">请确认表含 role 列且当前用户有 RLS 读权限。</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-2xl font-bold text-slate-900">管理员后台</h1>
        <p className="text-slate-600 text-center max-w-lg">
          当前账号 <span className="font-mono">{email}</span> 的 <code className="bg-slate-200 px-1 rounded">user_profiles.role</code> 不是
          <code className="bg-slate-200 px-1 rounded">admin</code>，无法使用写接口。
        </p>
        <p className="text-slate-500 text-sm text-center max-w-lg">
          本地可在项目根执行 <code className="bg-slate-200 px-1 rounded">npm run ensure:dev-user</code>（会将会员设为管理员，需
          Service Role 环境变量）。
        </p>
        <Link href="/" className="text-[#003399] text-sm underline">
          返回首页
        </Link>
      </div>
    );
  }

  const api = (path: string) => `${origin}${path}`;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Artiqore · 数据与 API 入口</h1>
        <p className="text-slate-600 text-sm mb-8">
          你当前为管理员。本页只做说明与链接；增删改数据请用下方 API（需携带{" "}
          <code className="bg-white border px-1 rounded text-xs">Authorization: Bearer &lt;access_token&gt;</code>
          ）或 Supabase 控制台表编辑器。
        </p>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">BFF（Next.js）根地址</h2>
          <p className="text-sm text-slate-600 mb-2">当前站点同源，即调试时的后端基址：</p>
          <code className="block w-full break-all rounded-lg bg-slate-100 p-3 text-sm">{origin || "（仅浏览器中可见）"}</code>
          <p className="text-xs text-slate-500 mt-2">
            本地开发常见端口见项目根 <code>AGENTS.md</code>（如 portman 分配的端口或 9090）。Flutter 默认用{" "}
            <code>WEB_DEV_PORT</code> / <code>API_BASE_URL</code> 对齐该地址。
          </p>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">只读/公开查询（GET）</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a className="text-[#003399] underline break-all" href={api("/api/v1/schools?limit=5")} target="_blank" rel="noreferrer">
                {api("/api/v1/schools")}
              </a>{" "}
              — 院校列表
            </li>
            <li>
              <a className="text-[#003399] underline break-all" href={api("/api/v1/programs?limit=5")} target="_blank" rel="noreferrer">
                {api("/api/v1/programs")}
              </a>{" "}
              — 专业/项目列表
            </li>
            <li>
              <a className="text-[#003399] underline break-all" href={api("/api/v1/cases?limit=5")} target="_blank" rel="noreferrer">
                {api("/api/v1/cases")}
              </a>{" "}
              — 案例
            </li>
          </ul>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">写操作（需管理员 + Bearer）</h2>
          <p className="text-sm text-slate-600 mb-2">
            <code>POST /api/v1/schools</code>、<code>POST /api/v1/programs</code> 等需在请求头带登录后的 Supabase
            <code>access_token</code>。可用浏览器扩展、curl 或自写小工具调用。
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">表数据（推荐）</h2>
          <p className="text-sm text-slate-600">
            在 Supabase Dashboard → Table Editor 中管理 <code>schools</code>、<code>programs</code>、<code>user_profiles</code> 等，与
            BFF 使用同一项目数据库。
          </p>
        </section>

        <p className="mt-8 text-xs text-slate-500">
          已登录：{email}（admin）
        </p>
      </div>
    </div>
  );
}
