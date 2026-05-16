import { createClient } from "@/lib/supabase/server";
import { DiscoverPageClient } from "@/components/artlink/discover-page-client";
import type { CommunityPost } from "@/lib/supabase/types";

type CommunityPostRow = Omit<CommunityPost, "user_profiles">;

export default async function DiscoverPage() {
  const supabase = await createClient();

  const [{ data: communityRows }, { data: qaPosts }] = await Promise.all([
    supabase
      .from("community_posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(24),
    supabase
      .from("posts")
      .select("*, user_profiles(nickname)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const posts = (communityRows ?? []) as CommunityPostRow[];
  const authorIds = [...new Set(posts.map((p) => p.author_id).filter(Boolean))];
  const { data: profiles } = authorIds.length
    ? await supabase
        .from("user_profiles")
        .select("id, nickname, avatar_url")
        .in("id", authorIds)
    : { data: [] };
  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      { nickname: profile.nickname, avatar_url: profile.avatar_url },
    ])
  );

  const communityPosts: CommunityPost[] = posts.map((post) => ({
    ...post,
    user_profiles: profileMap.get(post.author_id) ?? null,
  }));

  return (
    <DiscoverPageClient
      communityPosts={communityPosts}
      qaPosts={qaPosts ?? []}
    />
  );
}
