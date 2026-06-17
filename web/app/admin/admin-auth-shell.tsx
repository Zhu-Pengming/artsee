"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Loader2, LogIn, ShieldAlert, ShieldCheck } from "lucide-react";

type AuthState = "checking" | "missing" | "forbidden" | "ready";

function readToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("artiqore_access_token") ||
    localStorage.getItem("access_token") ||
    ""
  );
}

function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("artiqore_access_token");
  localStorage.removeItem("access_token");
}

export default function AdminAuthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>("checking");
  const [message, setMessage] = useState("");

  const loginHref = useMemo(() => {
    const redirect = pathname?.startsWith("/admin") ? pathname : "/admin";
    return `/admin/login?redirect=${encodeURIComponent(redirect || "/admin")}`;
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setState("ready");
      return;
    }

    const token = readToken();
    if (!token) {
      setMessage("");
      setState("missing");
      return;
    }

    let cancelled = false;
    setState("checking");
    fetch("/api/v1/admin/session", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        if (cancelled) return;
        if (res.ok) {
          setMessage("");
          setState("ready");
          return;
        }
        if (res.status === 401) clearToken();
        setMessage(body.error || body.message || "需要管理员权限");
        setState(res.status === 401 ? "missing" : "forbidden");
      })
      .catch(() => {
        if (cancelled) return;
        setMessage("无法验证管理员登录状态，请稍后重试。");
        setState("forbidden");
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (state === "ready") return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#f7f5ef] px-5 py-6 text-[#1a1a1a] md:px-8">
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
        <section className="w-full rounded-lg border border-black/10 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#003399]/8 text-[#003399]">
            {state === "checking" ? (
              <Loader2 size={22} className="animate-spin" />
            ) : state === "forbidden" ? (
              <ShieldAlert size={22} />
            ) : (
              <ShieldCheck size={22} />
            )}
          </div>
          <h1 className="text-2xl font-black tracking-normal">
            {state === "checking"
              ? "正在验证管理员身份"
              : state === "forbidden"
                ? "当前账号不是管理员"
                : "请先登录运营后台"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-black/56">
            后台权限由 Supabase Auth 登录态和 user_profiles.role=admin 共同决定。服务器 SSH
            只用于运维，不作为产品内管理员身份。
          </p>
          {message ? (
            <div className="mt-5 rounded-lg border border-[#d90429]/20 bg-[#d90429]/6 px-4 py-3 text-sm font-bold text-[#d90429]">
              {message}
            </div>
          ) : null}
          {state !== "checking" ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={loginHref}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#003399] px-4 text-sm font-bold text-white hover:bg-[#002a80]"
              >
                <LogIn size={16} />
                管理员登录
              </Link>
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-black/10 bg-white px-4 text-sm font-bold text-black/70 hover:border-[#003399]/30 hover:text-[#003399]"
              >
                返回前台
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
