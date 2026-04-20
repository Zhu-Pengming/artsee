import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/components/i18n-provider";
import { AppShell } from "@/components/app-shell";

const notoSansSc = Noto_Sans_SC({
  weight: ["400", "500", "700"],
  subsets: ["cyrillic", "latin", "latin-ext", "vietnamese"],
  display: "swap",
  variable: "--font-noto-sans-sc",
});

export const metadata: Metadata = {
  title: "ArtLink — The Digital Curator",
  description: "Bridging the gap between avant-garde creation and luxury acquisition. A dedicated platform for the modern connoisseur and the professional artist.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh';
  const messages = (await import(`../messages/${locale}.json`)).default;

  return (
    <html
      lang={locale}
      className={`h-full antialiased ${notoSansSc.variable}`}
    >
      <body className="min-h-full bg-surface text-on-surface selection:bg-secondary/20 selection:text-secondary">
        <I18nProvider locale={locale} messages={messages}>
          <AppShell>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
