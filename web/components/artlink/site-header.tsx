"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-al-silver/60 bg-al-shell/85 backdrop-blur-xl px-4 sm:px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4 sm:gap-8">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-al-cobalt rounded-xl flex items-center justify-center text-al-shell font-serif font-bold text-xl shadow-md">
            艺
          </div>
          <span className="text-lg sm:text-xl font-serif font-bold text-al-ink tracking-tight hidden min-[400px]:inline">
            Artiqore 艺衡
          </span>
        </Link>

        <div className="flex-1 max-w-2xl relative group min-w-0">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-al-ink/30 group-focus-within:text-al-cobalt transition-colors pointer-events-none"
            size={18}
          />
          <input
            type="search"
            placeholder="搜索院校、案例、论坛、课程…"
            className="w-full bg-al-silver/50 border-none rounded-full py-2.5 pl-12 pr-4 text-sm text-al-ink placeholder:text-al-ink/35 focus:ring-2 focus:ring-al-cobalt/20 transition-all outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value.trim();
                if (q) router.push(`/explore?school=${encodeURIComponent(q)}`);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <Link
            href="/explore"
            className="hidden sm:flex items-center gap-1.5 text-al-ink/60 hover:text-al-cobalt transition-colors"
          >
            <MapPin size={18} />
            <span className="text-xs font-semibold">选校</span>
          </Link>
          {user ? (
            <button
              type="button"
              className="relative text-al-ink/60 hover:text-al-cobalt transition-colors p-1"
              aria-label="通知"
            >
              <Bell size={22} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-al-shell" />
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-al-cobalt bg-al-cobalt/8 hover:bg-al-cobalt/15 px-3 py-2 rounded-full transition-colors"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
