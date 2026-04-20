import { createClient } from "@/lib/supabase/server";
import { DiscoverPageClient } from "@/components/artlink/discover-page-client";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*, user_profiles(nickname)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(24);

  return <DiscoverPageClient posts={posts ?? []} />;
}
