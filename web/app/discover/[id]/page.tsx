import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, Eye, Heart, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { CommunityPost } from "@/lib/supabase/types";
import { timeAgo } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };
type CommunityPostRow = Omit<CommunityPost, "user_profiles">;

export default async function DiscoverPostPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (!post) notFound();

  const row = post as CommunityPostRow;
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("nickname, avatar_url")
    .eq("id", row.author_id)
    .maybeSingle();

  return (
    <article className="pb-10 bg-[#faf9f7]">
      <div className="sticky top-0 z-10 bg-[#faf9f7]/95 backdrop-blur border-b border-[#eeece8] px-4 py-3">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b6b63]"
        >
          <ArrowLeft size={14} />
          返回发现
        </Link>
      </div>

      <div className="px-4 pt-4">
        <ImageStack post={row} />

        <section className="mt-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-[#e8e8e2] flex items-center justify-center text-xs font-bold text-[#1A4B8C]">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                profile?.nickname?.[0] ?? "艺"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#1e1e1a]">
                {profile?.nickname ?? "Artsee 用户"}
              </p>
              <p className="text-[11px] text-[#9b9b93]">
                {timeAgo(row.created_at)}
              </p>
            </div>
          </div>

          <h1 className="font-serif text-2xl font-bold leading-tight text-[#1e1e1a]">
            {row.title || "作品分享"}
          </h1>
          {row.body && (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#4d4d45]">
              {row.body}
            </div>
          )}

          <div className="mt-7 flex items-center gap-3 text-[#6b6b63]">
            <Metric icon={<Heart size={14} />} value={row.like_count} />
            <Metric icon={<MessageCircle size={14} />} value={row.comment_count} />
            <Metric icon={<Eye size={14} />} value={row.view_count} />
          </div>
        </section>
      </div>
    </article>
  );
}

function ImageStack({ post }: { post: CommunityPostRow }) {
  const images = post.image_urls ?? [];
  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] rounded-[24px] bg-gradient-to-br from-[#e8eef5] via-[#f4f1ec] to-[#d9e6f5] flex items-center justify-center px-8 text-center">
        <p className="font-serif text-2xl font-bold leading-snug text-[#1A4B8C]">
          {post.title || "作品分享"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {images.map((imageUrl, index) => (
        <div
          key={`${imageUrl}-${index}`}
          className="overflow-hidden rounded-[24px] bg-[#e8e8e2]"
        >
          <img
            src={imageUrl}
            alt=""
            className="w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      ))}
    </div>
  );
}

function Metric({ icon, value }: { icon: ReactNode; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold border border-[#eeece8]">
      {icon}
      {value}
    </span>
  );
}
