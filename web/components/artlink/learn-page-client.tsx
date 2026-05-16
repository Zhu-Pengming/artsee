"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  PlayCircle,
  ArrowUpRight,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type LearnSubTab = "courses" | "tools" | "schools";

export function LearnPageClient() {
  const [subTab, setSubTab] = useState<LearnSubTab>("courses");
  const [payingKey, setPayingKey] = useState<string | null>(null);

  const courses = [
    {
      title: "作品集辅导：RCA/UAL 申请全攻略",
      cat: "留学辅导",
      price: "¥2,999",
      amountTotal: 299900,
      seed: "course0",
    },
    {
      title: "当代油画技法：从构图到色彩表达",
      cat: "技法课",
      price: "¥1,200",
      amountTotal: 120000,
      seed: "course1",
    },
    {
      title: "艺术家职业商业课：定价、版权与合同",
      cat: "职业发展",
      price: "¥800",
      amountTotal: 80000,
      seed: "course2",
    },
  ];

  async function startCheckout(course: (typeof courses)[number]) {
    setPayingKey(course.title);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/v1/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: course.title,
          itemType: "course",
          itemId: course.seed,
          amountTotal: course.amountTotal,
          currency: "cny",
          metadata: { source: "learn_page", category: course.cat },
        }),
      });
      const payload = await res.json();
      if (!res.ok || payload.success !== true) {
        throw new Error(payload.error || "创建支付订单失败");
      }
      if (!payload.data?.checkoutUrl) {
        throw new Error("支付链接为空");
      }
      window.location.href = payload.data.checkoutUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "创建支付订单失败";
      alert(msg);
    } finally {
      setPayingKey(null);
    }
  }

  return (
    <div className="space-y-10 pb-10 px-6 md:px-12 lg:px-24 pt-6">
      <div className="flex gap-8 sm:gap-10 border-b border-al-silver/80 pb-4 overflow-x-auto scrollbar-hide">
        {(
          [
            { id: "courses" as const, label: "课程中心" },
            { id: "tools" as const, label: "作品集工具" },
            { id: "schools" as const, label: "院校与资讯" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`text-sm font-bold tracking-widest transition-all whitespace-nowrap shrink-0 relative ${
              subTab === tab.id
                ? "text-al-cobalt"
                : "text-al-ink/40 hover:text-al-ink/60"
            }`}
          >
            {tab.label}
            {subTab === tab.id && (
              <motion.div
                layoutId="learn-underline"
                className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-al-cobalt"
              />
            )}
          </button>
        ))}
      </div>

      {subTab === "courses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {courses.map((item, i) => (
            <article
              key={i}
              className="bg-al-silver/40 rounded-3xl overflow-hidden border border-al-silver/60 group cursor-pointer hover:shadow-2xl hover:shadow-al-silver/40 transition-all block"
            >
              <div className="aspect-video bg-al-silver/50 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${item.seed}/800/450`}
                  alt=""
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-al-ink/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle size={48} className="text-al-shell" />
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <span className="text-[10px] font-bold text-al-cobalt/70 bg-al-cobalt/5 px-2 py-0.5 rounded uppercase tracking-widest mb-4 inline-block">
                  {item.cat}
                </span>
                <h4 className="text-xl font-serif font-bold mb-6 leading-tight text-al-ink">
                  {item.title}
                </h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-al-cobalt">
                    {item.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => startCheckout(item)}
                    disabled={payingKey === item.title}
                    className="inline-flex items-center gap-1.5 rounded-full bg-al-cobalt px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-al-cobalt/90 disabled:opacity-60"
                  >
                    <ShoppingBag size={14} />
                    {payingKey === item.title ? "处理中" : "购买"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {subTab === "tools" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
          {["作品上传", "智能排版", "导师点评", "院校匹配", "案例库"].map(
            (tool) => (
              <Link
                key={tool}
                href={tool === "案例库" ? "/cases" : "/cases/new"}
                className="bg-al-silver/40 p-6 sm:p-8 rounded-3xl text-center hover:bg-al-silver/60 transition-all cursor-pointer group border border-transparent hover:border-al-cobalt/15 block"
              >
                <div className="w-14 h-14 rounded-full bg-al-shell flex items-center justify-center mx-auto mb-4 text-al-ink/40 group-hover:text-al-cobalt transition-all group-hover:scale-110 shadow-sm">
                  <Plus size={28} />
                </div>
                <span className="text-sm font-bold text-al-ink/80">{tool}</span>
              </Link>
            )
          )}
        </div>
      )}

      {subTab === "schools" && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                name: "Royal College of Art",
                location: "London, UK",
                rank: "#1 Art & Design",
                img: "https://picsum.photos/seed/rca/800/400",
              },
              {
                name: "University of the Arts London",
                location: "London, UK",
                rank: "#2 Art & Design",
                img: "https://picsum.photos/seed/ual/800/400",
              },
            ].map((school, i) => (
              <Link
                key={i}
                href="/explore"
                className="group cursor-pointer relative overflow-hidden rounded-3xl aspect-[2/1] block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={school.img}
                  alt=""
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-al-ink/85 via-al-ink/25 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-al-cobalt-muted uppercase tracking-widest mb-2">
                    {school.rank}
                  </span>
                  <h4 className="text-2xl font-serif font-bold text-al-shell mb-1">
                    {school.name}
                  </h4>
                  <p className="text-al-shell/60 text-xs">{school.location}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="bg-al-silver/40 p-8 sm:p-10 rounded-3xl border border-al-silver/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h5 className="text-sm font-bold uppercase tracking-widest text-al-ink/40">
                全球艺术资讯
              </h5>
              <Link
                href="/forum"
                className="text-xs font-bold text-al-cobalt hover:underline"
              >
                进入论坛 →
              </Link>
            </div>
            <div className="space-y-5">
              {[
                "2026 年秋季入学申请截止日期汇总",
                "作品集准备：如何展现你的批判性思维",
                "艺术生就业前景：数字媒体与跨学科趋势",
              ].map((news, i) => (
                <Link
                  key={i}
                  href="/forum"
                  className="flex justify-between items-center group cursor-pointer border-b border-al-silver/50 pb-5 last:border-0 last:pb-0"
                >
                  <span className="text-base sm:text-lg font-serif font-bold text-al-ink/80 group-hover:text-al-cobalt transition-colors pr-4">
                    {news}
                  </span>
                  <ArrowUpRight
                    size={20}
                    className="text-al-ink/20 group-hover:text-al-cobalt transition-all shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
