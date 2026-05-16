"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, MessageSquare, Compass, User, Sparkles } from "lucide-react";

const tabs = [
  { href: "/", label: "首页", icon: Home },
  { href: "/explore", label: "院校", icon: Info },
  { href: "/learn", label: "艺享会", icon: Sparkles },
  { href: "/forum", label: "社区", icon: MessageSquare },
  { href: "/discover", label: "发现", icon: Compass },
  { href: "/profile", label: "我的", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden flex-shrink-0 border-t border-[#d8d3ca]/70 bg-white/85 backdrop-blur-xl pt-2 pb-safe">
      <div className="grid grid-cols-6 h-16 px-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center space-y-1 py-1 transition-colors ${
                active ? "text-[#1A4B8C]" : "text-gray-400"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                active ? "bg-[#1A4B8C]/5 scale-110" : ""
              }`}>
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span className="text-[10px] font-medium tracking-wider uppercase leading-none">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
