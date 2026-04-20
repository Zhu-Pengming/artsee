"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Handshake, GraduationCap, User } from "lucide-react";

const tabs = [
  { href: "/", label: "首页", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/discover",
    label: "发现",
    icon: Compass,
    match: (p: string) => p.startsWith("/discover") || p.startsWith("/forum"),
  },
  {
    href: "/collab",
    label: "合作",
    icon: Handshake,
    match: (p: string) => p.startsWith("/collab") || p.startsWith("/market"),
  },
  {
    href: "/learn",
    label: "学习",
    icon: GraduationCap,
    match: (p: string) =>
      p.startsWith("/learn") || p.startsWith("/explore") || p.startsWith("/cases"),
  },
  {
    href: "/profile",
    label: "我的",
    icon: User,
    match: (p: string) => p.startsWith("/profile"),
  },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-1.5rem)]">
      <div className="bg-al-ink/92 backdrop-blur-2xl px-2 sm:px-4 py-2.5 rounded-full border border-white/10 shadow-2xl flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap shrink-0 ${
                active
                  ? "bg-al-shell text-al-ink shadow-lg"
                  : "text-al-shell/45 hover:text-al-shell/75"
              }`}
            >
              <Icon size={20} className={active ? "text-al-cobalt" : ""} />
              {active && (
                <span className="text-xs font-bold tracking-wider hidden sm:inline">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
