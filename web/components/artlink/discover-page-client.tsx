"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import type { Post } from "@/lib/supabase/types";
import { timeAgo } from "@/lib/utils";

type SubTab = "following" | "recommended" | "qa";

const qaSamples = [
  {
    q: "艺术留学怎么选校？有哪些避坑指南？",
    a: "128 位同学已参与讨论",
    cat: "留学申请",
  },
  {
    q: "作品集叙事和排版，怎样更符合院校口味？",
    a: "86 位创作者已参与讨论",
    cat: "专业学习",
  },
  {
    q: "一二级市场规则是什么？创作者如何定价？",
    a: "210 位专业人士已参与讨论",
    cat: "职业发展",
  },
];

export function DiscoverPageClient({ posts }: { posts: Post[] }) {
  const [subTab, setSubTab] = useState<SubTab>("recommended");

  const gridPosts = posts.slice(0, 8);

  return (
    <div className="space-y-10 pb-10 px-6 md:px-12 lg:px-24 pt-6">
      <div className="flex gap-8 sm:gap-10 border-b border-al-silver/80 pb-4 overflow-x-auto scrollbar-hide">
        {(
          [
            { id: "following" as const, label: "关注" },
            { id: "recommended" as const, label: "推荐" },
            { id: "qa" as const, label: "问答" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`text-sm font-bold tracking-widest transition-all relative shrink-0 ${
              subTab === tab.id
                ? "text-al-cobalt"
                : "text-al-ink/40 hover:text-al-ink/60"
            }`}
          >
            {tab.label}
            {subTab === tab.id && (
              <motion.div
                layoutId="discover-underline"
                className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-al-cobalt"
              />
            )}
          </button>
        ))}
      </div>

      {subTab === "qa" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-8 space-y-5">
            {posts.slice(0, 5).length > 0 ? (
              posts.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/forum/${p.id}`}
                  className="block bg-al-silver/40 p-6 sm:p-8 rounded-2xl hover:bg-al-silver/60 transition-all border border-transparent hover:border-al-cobalt/15"
                >
                  <span className="text-[10px] font-bold text-al-cobalt/70 bg-al-cobalt/5 px-2 py-0.5 rounded uppercase tracking-widest mb-3 inline-block">
                    {p.type === "question"
                      ? "问答"
                      : p.type === "discussion"
                        ? "讨论"
                        : "资讯"}
                  </span>
                  <h4 className="text-lg sm:text-xl font-serif font-bold text-al-ink mb-2 leading-snug">
                    {p.title}
                  </h4>
                  <p className="text-al-ink/45 text-sm line-clamp-2">{p.content}</p>
                  <p className="text-al-ink/35 text-xs mt-3">
                    {timeAgo(p.created_at)}
                  </p>
                </Link>
              ))
            ) : (
              qaSamples.map((item, i) => (
                <Link
                  key={i}
                  href="/forum"
                  className="block bg-al-silver/40 p-6 sm:p-8 rounded-2xl hover:bg-al-silver/60 transition-all cursor-pointer border border-transparent hover:border-al-cobalt/15"
                >
                  <span className="text-[10px] font-bold text-al-cobalt/70 bg-al-cobalt/5 px-2 py-0.5 rounded uppercase tracking-widest mb-4 inline-block">
                    {item.cat}
                  </span>
                  <h4 className="text-lg sm:text-xl font-serif font-bold mb-3 text-al-ink">
                    {item.q}
                  </h4>
                  <p className="text-al-ink/40 text-sm">{item.a}</p>
                </Link>
              ))
            )}
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-al-ink text-al-shell p-6 sm:p-8 rounded-3xl">
              <h5 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-60">
                问答分类
              </h5>
              <ul className="space-y-3 text-sm font-medium">
                {["留学申请", "专业学习", "职业发展", "市场与商业", "版权与法律"].map(
                  (c) => (
                    <li key={c}>
                      <Link
                        href="/forum"
                        className="hover:text-al-cobalt-muted flex justify-between items-center group py-1"
                      >
                        <span>{c}</span>
                        <ChevronRight
                          size={14}
                          className="opacity-40 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
            <Link
              href="/forum/new"
              className="block w-full py-4 bg-al-cobalt text-al-shell rounded-full text-sm font-bold text-center shadow-xl shadow-al-cobalt/20 hover:opacity-95 transition-opacity"
            >
              我要提问
            </Link>
          </div>
        </div>
      ) : subTab === "following" ? (
        <div className="text-center py-20 text-al-ink/45">
          <p className="font-serif text-lg text-al-ink/70 mb-2">关注动态</p>
          <p className="text-sm mb-6">登录后查看你关注的创作者与院校更新</p>
          <Link
            href="/auth/login?redirect=/discover"
            className="inline-flex px-6 py-3 rounded-full bg-al-cobalt text-al-shell text-sm font-bold"
          >
            登录
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {gridPosts.map((p, i) => (
            <Link
              key={p.id}
              href={`/forum/${p.id}`}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-al-silver/40 mb-3 relative">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-al-cobalt/25 via-al-silver/50 to-al-cobalt-muted/30 group-hover:from-al-cobalt/35 transition-all duration-700"
                  aria-hidden
                />
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-al-shell/95 backdrop-blur p-3 rounded-xl shadow-xl">
                    <p className="text-[10px] font-bold text-al-ink truncate">
                      {p.title}
                    </p>
                    <p className="text-[8px] text-al-ink/40 uppercase tracking-widest mt-1">
                      论坛
                    </p>
                  </div>
                </div>
              </div>
              <h5 className="text-sm font-bold text-al-ink line-clamp-2">
                {p.title}
              </h5>
              <p className="text-[10px] text-al-ink/40 uppercase tracking-widest mt-1">
                {timeAgo(p.created_at)}
              </p>
            </Link>
          ))}
          {gridPosts.length === 0 &&
            [...Array(8)].map((_, i) => (
              <div key={i} className="group cursor-default opacity-60">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-al-silver/30 mb-3 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://picsum.photos/seed/disc${i}/600/800`}
                    alt=""
                    className="w-full h-full object-cover grayscale"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h5 className="text-sm font-bold text-al-ink">精选占位 #{i + 1}</h5>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
