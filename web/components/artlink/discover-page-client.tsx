"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ChevronRight,
  Eye,
  Heart,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";
import type { CommunityPost, Post } from "@/lib/supabase/types";
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

export function DiscoverPageClient({
  communityPosts,
  qaPosts,
}: {
  communityPosts: CommunityPost[];
  qaPosts: Post[];
}) {
  const [subTab, setSubTab] = useState<SubTab>("recommended");
  const gridPosts = communityPosts.slice(0, 12);

  return (
    <div className="space-y-8 pb-10 px-5 pt-5">
      <div className="flex gap-8 border-b border-al-silver/80 pb-4 overflow-x-auto scrollbar-hide">
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
        <QaPanel posts={qaPosts} />
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
        <CommunityGrid posts={gridPosts} />
      )}
    </div>
  );
}

function CommunityGrid({ posts }: { posts: CommunityPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="opacity-70">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-al-silver/30 mb-3 relative">
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
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {posts.map((post) => (
        <Link key={post.id} href={`/discover/${post.id}`} className="group">
          <article className="card-press">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-al-silver/40 mb-3 relative">
              {post.image_urls?.[0] ? (
                <img
                  src={post.image_urls[0]}
                  alt=""
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-al-cobalt/20 via-al-silver/60 to-al-cobalt-muted/25 flex items-center justify-center px-4 text-center">
                  <ImageIcon size={28} className="text-al-cobalt/60" />
                </div>
              )}
              <div className="absolute inset-x-2 bottom-2 rounded-xl bg-al-shell/95 p-2.5 shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-[10px] font-bold text-al-ink truncate">
                  {post.user_profiles?.nickname ?? "Artsee 用户"}
                </p>
                <p className="mt-1 text-[8px] uppercase tracking-widest text-al-ink/40">
                  {timeAgo(post.created_at)}
                </p>
              </div>
            </div>
            <h5 className="text-sm font-bold text-al-ink line-clamp-2">
              {post.title || "作品分享"}
            </h5>
            {post.body && (
              <p className="mt-1 text-[11px] leading-relaxed text-al-ink/45 line-clamp-2">
                {post.body}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-al-ink/35">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                <Heart size={12} />
                {post.like_count}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                <MessageCircle size={12} />
                {post.comment_count}
              </span>
              <span className="ml-auto inline-flex items-center gap-1 text-[10px]">
                <Eye size={12} />
                {post.view_count}
              </span>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

function QaPanel({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {posts.slice(0, 5).length > 0
          ? posts.slice(0, 5).map((post) => (
              <Link
                key={post.id}
                href={`/forum/${post.id}`}
                className="block bg-al-silver/40 p-5 rounded-2xl hover:bg-al-silver/60 transition-all border border-transparent hover:border-al-cobalt/15"
              >
                <span className="text-[10px] font-bold text-al-cobalt/70 bg-al-cobalt/5 px-2 py-0.5 rounded uppercase tracking-widest mb-3 inline-block">
                  {post.type === "question"
                    ? "问答"
                    : post.type === "discussion"
                      ? "讨论"
                      : "资讯"}
                </span>
                <h4 className="text-lg font-serif font-bold text-al-ink mb-2 leading-snug">
                  {post.title}
                </h4>
                <p className="text-al-ink/45 text-sm line-clamp-2">
                  {post.content}
                </p>
                <p className="text-al-ink/35 text-xs mt-3">
                  {timeAgo(post.created_at)}
                </p>
              </Link>
            ))
          : qaSamples.map((item, i) => (
              <Link
                key={i}
                href="/forum"
                className="block bg-al-silver/40 p-5 rounded-2xl hover:bg-al-silver/60 transition-all border border-transparent hover:border-al-cobalt/15"
              >
                <span className="text-[10px] font-bold text-al-cobalt/70 bg-al-cobalt/5 px-2 py-0.5 rounded uppercase tracking-widest mb-4 inline-block">
                  {item.cat}
                </span>
                <h4 className="text-lg font-serif font-bold mb-3 text-al-ink">
                  {item.q}
                </h4>
                <p className="text-al-ink/40 text-sm">{item.a}</p>
              </Link>
            ))}
      </div>

      <div className="bg-al-ink text-al-shell p-6 rounded-3xl">
        <h5 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-60">
          问答分类
        </h5>
        <ul className="space-y-3 text-sm font-medium">
          {["留学申请", "专业学习", "职业发展", "市场与商业", "版权与法律"].map(
            (category) => (
              <li key={category}>
                <Link
                  href="/forum"
                  className="hover:text-al-cobalt-muted flex justify-between items-center group py-1"
                >
                  <span>{category}</span>
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
  );
}
