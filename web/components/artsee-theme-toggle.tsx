"use client";

import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { setArtseeThemeClient, type ArtseeTheme } from "@/lib/artsee-theme";

type Props = {
  className?: string;
};

/**
 * 昼：月亮点击进入夜；夜：太阳点击回到昼
 */
export function ArtseeThemeToggle({ className = "" }: Props) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const onClick = useCallback(() => {
    const next: ArtseeTheme = isDark ? "light" : "dark";
    setArtseeThemeClient(next);
    setIsDark(next === "dark");
    router.refresh();
  }, [isDark, router]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "bg-al-silver/60 text-al-ink/70 p-3 rounded-full hover:bg-al-silver transition-colors " +
        className
      }
      title={isDark ? "切换为浅色" : "切换为深色"}
      aria-label={isDark ? "切换为浅色主题" : "切换为深色主题"}
    >
      {isDark ? <Sun size={20} className="text-amber-200/90" /> : <Moon size={20} />}
    </button>
  );
}
