/** 与 Flutter app 的 SharedPreferences 键位语义一致，便于同账号多端体验 */
export const ARTSEE_THEME_KEY = "artsee-theme" as const;
export type ArtseeTheme = "light" | "dark";

export function getThemeFromCookieString(cookie: string | undefined | null): ArtseeTheme {
  if (cookie === "dark" || cookie === "light") return cookie;
  return "light";
}

export function setArtseeThemeClient(next: ArtseeTheme) {
  if (typeof document === "undefined") return;
  if (next === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  try {
    localStorage.setItem(ARTSEE_THEME_KEY, next);
  } catch {
    /* ignore */
  }
  document.cookie = `${ARTSEE_THEME_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`;
}
