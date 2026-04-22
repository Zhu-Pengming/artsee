'use client'

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Search, User as UserIcon, Settings, LayoutDashboard, LogOut } from "lucide-react";
import { useTranslations } from "@/components/i18n-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SearchModal } from "@/components/search-modal";
import { ArtseeThemeToggle } from "@/components/artsee-theme-toggle";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('user_profiles')
        .select('role, nickname, avatar_url, phone')
        .eq('id', userId)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setIsAdmin(data.role === 'admin');
        setNickname(data.nickname);
        setAvatarUrl(data.avatar_url);
        setPhone(data.phone);
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      const u = data.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (cancelled) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else {
        setIsAdmin(false);
        setNickname(null);
        setAvatarUrl(null);
        setPhone(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const navItems = [
    { href: '/discover', label: t('discover') },
    { href: '/collab', label: t('collaborate') },
    { href: '/learn', label: t('learn') },
    { href: '/cases', label: t('cases') },
  ];

  const isActive = (href: string) => {
    if (href === '/discover') return pathname === '/discover' || pathname?.startsWith('/forum');
    if (href === '/cases') return pathname === '/cases' || pathname?.startsWith('/cases/');
    return pathname === href;
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setNickname(null);
    setAvatarUrl(null);
    setPhone(null);
    setMenuOpen(false);
  };

  const displayName = nickname || user?.email || '用户';
  const displayId = user?.id ? `${user.id.slice(0, 8)}…` : '';
  const displayContact = user?.email || phone || '';
  const avatarInitial = (nickname || user?.email || '?')[0];

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass-nav">
        <nav className="flex justify-between items-center px-6 md:px-12 py-6 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold font-headline tracking-tighter text-on-surface"
          >
            <Link href="/">Artiqore</Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-10 font-headline tracking-tight font-medium">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  className={`transition-colors pb-1 ${
                    active
                      ? 'text-primary border-b border-on-surface'
                      : 'text-primary/60 hover:text-on-surface'
                  }`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-low border border-outline-variant/10 hover:border-outline-variant/30 transition-colors"
              aria-label={t('searchPlaceholder')}
            >
              <Search className="text-on-surface-variant w-4 h-4" />
            </button>
            <LocaleSwitcher />
            <ArtseeThemeToggle />
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/20 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="用户菜单"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      {avatarInitial}
                    </div>
                  )}
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/10 z-50 py-2 overflow-hidden">
                      {/* 用户信息头部 */}
                      <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border border-outline-variant/20">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary text-sm font-medium">
                              {avatarInitial}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-on-surface truncate">
                            {displayName}
                          </p>
                          <p className="text-[11px] text-on-surface-variant truncate">
                            ID: {displayId}
                          </p>
                          {displayContact && (
                            <p className="text-[11px] text-on-surface-variant/70 truncate">
                              {displayContact}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 菜单项 */}
                      <Link
                        href={`/profile/${user.id}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-on-surface-variant" />
                        个人主页
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <Settings className="w-4 h-4 text-on-surface-variant" />
                        设置
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-on-surface-variant" />
                          后台管理
                        </Link>
                      )}

                      <div className="border-t border-outline-variant/10 my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-primary text-on-primary px-6 py-2.5 rounded-md font-medium text-sm active:scale-95 transition-transform"
              >
                {t('signIn')}
              </Link>
            )}
          </div>
        </nav>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
