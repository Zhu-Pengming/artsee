'use client'

import { useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { useTranslations } from "@/components/i18n-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SearchModal } from "@/components/search-modal";

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

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

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass-nav">
        <nav className="flex justify-between items-center px-6 md:px-12 py-6 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold font-headline tracking-tighter text-on-surface"
          >
            <Link href="/">ArtLink</Link>
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
              className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/10 hover:border-outline-variant/30 transition-colors"
            >
              <Search className="text-on-surface-variant w-4 h-4" />
              <span className="text-xs w-32 text-left text-on-surface-variant/50 ml-2">
                {t('searchPlaceholder')}
              </span>
            </button>
            <LocaleSwitcher />
            <Link
              href="/auth/login"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-md font-medium text-sm active:scale-95 transition-transform"
            >
              {t('signIn')}
            </Link>
          </div>
        </nav>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
