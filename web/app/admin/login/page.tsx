"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { ArrowLeft, Loader2, LogIn, ShieldCheck } from "lucide-react";

type LoginResponse = {
  token?: string;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  message?: string;
  error?: string;
};

function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/admin") || value.startsWith("/admin/login")) {
    return "/admin";
  }
  return value;
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => safeRedirect(searchParams.get("redirect")),
    [searchParams]
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as LoginResponse;
      if (!res.ok || body.error || body.message === "邮箱或密码错误") {
        throw new Error(body.error || body.message || `登录失败 ${res.status}`);
      }
      if (!body.token) {
        throw new Error("登录成功但没有返回访问令牌，请检查 Supabase Auth 配置。");
      }
      localStorage.setItem("artiqore_access_token", body.token);
      localStorage.setItem("access_token", body.token);
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-6 text-[#1a1a1a] md:px-8">
      <div className="mx-auto flex min-h-[76vh] max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm md:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-black/10 bg-[#003399] p-6 text-white md:border-b-0 md:border-r md:border-black/10 md:p-8">
            <Link
              href="/"
              className="mb-8 inline-flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3 text-sm font-bold text-white hover:bg-white/16"
            >
              <ArrowLeft size={16} />
              返回前台
            </Link>
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/12">
              <ShieldCheck size={23} />
            </div>
            <h1 className="text-3xl font-black tracking-normal">运营后台登录</h1>
            <p className="mt-4 text-sm font-medium leading-6 text-white/76">
              使用 Supabase Auth 管理员账号登录。登录后，所有后台接口仍会校验
              user_profiles.role=admin。
            </p>
          </div>

          <form className="flex flex-col gap-5 p-6 md:p-8" onSubmit={submit}>
            <div>
              <h2 className="text-xl font-black tracking-normal">管理员账号</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-black/54">
                如果登录后仍提示需要管理员权限，请在 Supabase 的 user_profiles 表中确认该用户 role 为
                admin。
              </p>
            </div>

            <label className="flex flex-col gap-2 text-sm font-bold text-black/70">
              邮箱
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                required
                className="h-11 rounded-lg border border-black/10 bg-white px-3 text-base font-semibold text-black outline-none transition focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/14"
                placeholder="admin@example.com"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-bold text-black/70">
              密码
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                required
                className="h-11 rounded-lg border border-black/10 bg-white px-3 text-base font-semibold text-black outline-none transition focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/14"
                placeholder="输入密码"
              />
            </label>

            {error ? (
              <div className="rounded-lg border border-[#d90429]/20 bg-[#d90429]/6 px-4 py-3 text-sm font-bold text-[#d90429]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#003399] px-4 text-sm font-black text-white transition hover:bg-[#002a80] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
              登录后台
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-6 text-[#1a1a1a] md:px-8">
      <div className="mx-auto flex min-h-[76vh] max-w-5xl items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-bold text-black/60 shadow-sm">
          <Loader2 size={17} className="animate-spin text-[#003399]" />
          正在载入后台登录
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
