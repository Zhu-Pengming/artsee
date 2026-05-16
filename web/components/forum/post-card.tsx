import { ThumbsUp, MessageCircle, Eye, BadgeCheck } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/lib/supabase/types";
import { timeAgo } from "@/lib/utils";

const typeStyle: Record<Post["type"], { label: string; cls: string }> = {
  question:   { label: "问答", cls: "bg-[#f5ead8] text-[#8c6230]" },
  discussion: { label: "讨论", cls: "bg-[#eef0eb] text-[#4a5c3e]" },
  news:       { label: "资讯", cls: "bg-[#f0ece6] text-[#5c3f20]" },
};

export function PostCard({ post }: { post: Post }) {
  const ts = typeStyle[post.type] ?? typeStyle.discussion;
  return (
    <Link href={`/forum/${post.id}`}>
      {/* Pinterest: card with warm border + generous radius */}
      <article className="bg-white rounded-[20px] border border-[#eeece8] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-3.5 active:scale-[0.985] transition-transform">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5c4033] to-[#3e2723] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
            {post.user_profiles?.nickname?.[0] ?? '?'}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11.5px] font-semibold text-[#1e1e1a]">
              {post.user_profiles?.nickname ?? '用户'}
            </span>
            {post.is_mentor_post && (
              <BadgeCheck size={13} className="text-[#8c6230]" />
            )}
          </div>
          <span className="text-[10px] text-[#9b9b93] ml-auto">{timeAgo(post.created_at)}</span>
        </div>

        <div className="flex gap-2 mb-1">
          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5 ${ts.cls}`}>
            {ts.label}
          </span>
          <h3 className="text-[13px] font-semibold text-[#1e1e1a] leading-snug line-clamp-2 tracking-tight">
            {post.title}
          </h3>
        </div>
        <p className="text-[11.5px] text-[#6b6b63] line-clamp-2 leading-relaxed mb-2.5 ml-0.5">
          {post.content}
        </p>

        {/* Tags — warm pill style */}
        {post.tags?.length > 0 && (
          <div className="flex gap-1.5 mb-2.5 flex-wrap">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[9.5px] text-[#6b6b63] bg-[#e8e8e2] border border-[#d8d4ce] px-2 py-0.5 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-[#9b9b93]">
            <ThumbsUp size={12} />
            <span className="text-[10.5px] font-medium">{post.like_count}</span>
          </button>
          <button className="flex items-center gap-1 text-[#9b9b93]">
            <MessageCircle size={12} />
            <span className="text-[10.5px] font-medium">{post.answer_count} 回答</span>
          </button>
          <div className="flex items-center gap-1 text-[#c4c4bc]">
            <Eye size={12} />
            <span className="text-[10.5px]">{post.view_count}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
