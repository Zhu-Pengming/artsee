"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Calendar,
  Verified,
} from "lucide-react";

type CollabSubTab = "plaza" | "artists" | "exhibitions" | "projects";

export function CollabPageClient() {
  const [subTab, setSubTab] = useState<CollabSubTab>("plaza");

  return (
    <div className="space-y-10 pb-10 px-6 md:px-12 lg:px-24 pt-6">
      <div className="flex gap-8 sm:gap-10 border-b border-al-silver/80 pb-4 overflow-x-auto scrollbar-hide">
        {(
          [
            { id: "plaza" as const, label: "需求广场" },
            { id: "artists" as const, label: "艺术家库" },
            { id: "exhibitions" as const, label: "展览中心" },
            { id: "projects" as const, label: "联名项目" },
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
                layoutId="collab-underline"
                className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-al-cobalt"
              />
            )}
          </button>
        ))}
      </div>

      {subTab === "plaza" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              brand: "安缦酒店",
              type: "展览场地合作",
              budget: "¥150k - 300k",
              date: "2024.11.15",
            },
            {
              brand: "宝格丽",
              type: "联名设计",
              budget: "¥200k - 500k",
              date: "2024.12.01",
            },
            {
              brand: "UCCA",
              type: "艺术家代理",
              budget: "面议",
              date: "2024.10.30",
            },
            {
              brand: "路易威登",
              type: "礼盒视觉创作",
              budget: "¥100k - 200k",
              date: "2024.11.20",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-al-silver/40 p-6 sm:p-8 rounded-3xl border border-al-silver/60 hover:border-al-cobalt/30 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold text-al-ink/40 uppercase tracking-widest">
                  {item.brand}
                </span>
                <span className="text-[10px] font-bold text-al-cobalt bg-al-cobalt/5 px-3 py-1 rounded-full uppercase tracking-widest">
                  {item.type}
                </span>
              </div>
              <h4 className="text-xl font-serif font-bold mb-8 leading-tight text-al-ink">
                高端商业空间美学重塑计划
              </h4>
              <div className="grid grid-cols-2 gap-6 mb-8 text-xs">
                <div>
                  <p className="text-al-ink/30 uppercase tracking-tighter mb-1">
                    预算区间
                  </p>
                  <p className="font-bold text-al-cobalt">{item.budget}</p>
                </div>
                <div>
                  <p className="text-al-ink/30 uppercase tracking-tighter mb-1">
                    截止日期
                  </p>
                  <p className="font-bold text-al-ink/80">{item.date}</p>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-4 bg-al-ink text-al-shell rounded-full text-xs font-bold uppercase tracking-widest hover:bg-al-cobalt transition-all shadow-lg"
              >
                立即申请
              </button>
            </div>
          ))}
        </div>
      )}

      {subTab === "artists" && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="text-center group cursor-default">
              <div className="aspect-square rounded-3xl overflow-hidden bg-al-silver/30 mb-3 relative shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/art${i}/400/400`}
                  alt=""
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 right-3 bg-al-shell p-1.5 rounded-full shadow-xl">
                  <Verified size={14} className="text-al-cobalt" />
                </div>
              </div>
              <h5 className="text-sm font-bold text-al-ink">艺术家姓名</h5>
              <p className="text-[10px] text-al-ink/40 uppercase tracking-widest mt-1">
                纯艺 / 先锋
              </p>
            </div>
          ))}
        </div>
      )}

      {subTab === "exhibitions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {[
            {
              title: "感官之维：当代艺术联展",
              location: "上海 · 艺衡美术馆",
              date: "2024.11.15 - 2025.01.15",
              img: "https://picsum.photos/seed/exh1/1200/600",
            },
            {
              title: "数字游牧：新媒体艺术季",
              location: "北京 · 798艺术区",
              date: "2024.12.01 - 2025.02.28",
              img: "https://picsum.photos/seed/exh2/1200/600",
            },
          ].map((exh, i) => (
            <div key={i} className="group cursor-default">
              <div className="aspect-[2/1] rounded-3xl overflow-hidden mb-5 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={exh.img}
                  alt=""
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-5 right-5 bg-al-shell/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-al-cobalt uppercase tracking-widest">
                  正在展出
                </div>
              </div>
              <h4 className="text-2xl font-serif font-bold text-al-ink group-hover:text-al-cobalt transition-colors mb-2">
                {exh.title}
              </h4>
              <div className="flex flex-wrap items-center gap-4 text-al-ink/40 text-xs">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} /> {exh.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} /> {exh.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "projects" && (
        <div className="bg-al-ink text-al-shell p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-bold text-al-cobalt-muted uppercase tracking-[0.3em] mb-6 block">
              Co-Branding Projects
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
              联名项目：
              <br />
              探索商业与艺术的边界
            </h3>
            <p className="text-al-shell/60 text-base sm:text-lg mb-10 leading-relaxed">
              我们连接品牌与创作者，通过空间、产品与视觉协作，让艺术价值被看见。
            </p>
            <a
              href="/market"
              className="inline-block bg-al-shell text-al-ink px-8 sm:px-10 py-3.5 rounded-full text-sm font-bold hover:bg-al-cobalt hover:text-al-shell transition-all shadow-2xl"
            >
              查看资源市集
            </a>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://picsum.photos/seed/collab-bg/800/800"
              alt=""
              className="w-full h-full object-cover grayscale"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
