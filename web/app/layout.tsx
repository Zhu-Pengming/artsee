import type { Metadata } from "next";
import { Poppins, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "艺见心 — 艺术留学一站式平台",
  description: "发现、收藏和分享艺术留学资讯，找到你的理想院校",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${poppins.variable} ${notoSansSC.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f4f1ec]">
        <div className="min-h-screen bg-[#f7f5ef] font-sans selection:bg-[#1A4B8C]/10">
          <main className="scrollbar-hide scroll-smooth">{children}</main>
        </div>
      </body>
    </html>
  );
}
