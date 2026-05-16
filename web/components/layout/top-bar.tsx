"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/explore", label: "院校" },
  { href: "/learn", label: "艺享会" },
  { href: "/forum", label: "社区" },
  { href: "/discover", label: "发现" },
  { href: "/profile", label: "我的" },
];

const pageTitles: Record<string, string> = {
  "/":        "艺见心",
  "/discover": "发现",
  "/explore": "探索院校",
  "/cases":   "合作",
  "/forum":   "问答社区",
  "/profile": "我的",
  "/orders": "我的订单",
  "/learn": "学习",
  "/payment/success": "支付结果",
  "/payment/cancel": "支付结果",
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const title =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(
      ([path]) => path !== "/" && pathname.startsWith(`${path}/`)
    )?.[1] ??
    "艺见心";
  const isHome = pathname === "/";
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="flex-shrink-0 bg-white/75 backdrop-blur-md border-b border-[#d8d3ca]/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 h-[72px] px-6">
        <Link href="/" className="flex items-center gap-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#1A4B8C] flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-[#1A4B8C]/20">
            艺
          </div>
          <div className="hidden sm:block">
            <div className="text-xl font-serif font-bold text-[#171717] tracking-tighter italic">
              artiqore 艺见心
            </div>
            {!isHome && (
              <div className="text-[9px] uppercase tracking-[0.35em] text-[#171717]/30 font-bold">
                {title}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 max-w-xl hidden sm:flex">
          <div className="w-full bg-[#dedbd4]/50 shadow-inner rounded-full h-11 flex items-center px-5 gap-3 border border-white/70 focus-within:border-[#1A4B8C]/30 transition-all">
            <Search size={18} className="text-[#171717]/30" />
            <input
              type="text"
              placeholder="搜索艺术家、作品集资讯、灵感..."
              className="bg-transparent border-none text-sm focus:ring-0 focus:outline-none w-full placeholder:text-[#171717]/25"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-7">
          <nav className="hidden lg:flex items-center gap-7 mr-2">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-bold tracking-[0.2em] uppercase transition-all relative py-2 ${
                    active ? "text-[#1A4B8C]" : "text-[#171717]/40 hover:text-[#171717]/70"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A4B8C]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {user ? (
            <button className="w-11 h-11 rounded-full bg-white flex items-center justify-center border border-[#d8d3ca]/70 text-[#171717]/60 hover:text-[#1A4B8C] transition-colors shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-[#1A4B8C] rounded-full ring-2 ring-white" />
            </button>
          ) : (
            <button
              onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#171717] px-4 py-2.5 rounded-full shadow-sm active:scale-95 transition-transform uppercase tracking-widest"
            >
              <LogIn size={12} />
              登录
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
