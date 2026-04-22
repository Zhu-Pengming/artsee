import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/components/i18n-provider";
import { AppShell } from "@/components/app-shell";
import { getThemeFromCookieString } from "@/lib/artsee-theme";

const notoSansSc = Noto_Sans_SC({
  weight: ["400", "500", "700"],
  subsets: ["cyrillic", "latin", "latin-ext", "vietnamese"],
  display: "swap",
  variable: "--font-noto-sans-sc",
});

export const metadata: Metadata = {
  title: "Artiqore — The Digital Curator",
  description: "Bridging the gap between avant-garde creation and luxury acquisition. A dedicated platform for the modern connoisseur and the professional artist.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh';
  const serverTheme = getThemeFromCookieString(cookieStore.get("artsee-theme")?.value);
  const messages = (await import(`../messages/${locale}.json`)).default;
  const darkClass = serverTheme === "dark" ? "dark" : "";

  return (
    <html
      lang={locale}
      className={`h-full antialiased ${notoSansSc.variable} ${darkClass}`.trim()}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-surface text-on-surface selection:bg-secondary/20 selection:text-secondary">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var ls = localStorage.getItem('artsee-theme');
    if (ls === 'dark') { document.documentElement.classList.add('dark'); return; }
    if (ls === 'light') { document.documentElement.classList.remove('dark'); return; }
  } catch (e) {}
  ${serverTheme === "dark" ? "document.documentElement.classList.add('dark');" : ""}
})();`,
          }}
        />
        <I18nProvider locale={locale} messages={messages}>
          <AppShell>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
