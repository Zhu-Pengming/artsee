import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { buildTencentImIdentifier } from "@/lib/api/tencent-im";

type Ctx = { params: Promise<{ id: string }> };
type Row = Record<string, unknown>;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function intValue(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return Math.max(0, parsed);
  }
  return fallback;
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

function roleLabel(profile: Row) {
  if (profile.is_verified === true) {
    switch (cleanText(profile.user_role)) {
      case "artist":
        return "认证艺术家";
      case "student":
        return "认证学生";
      case "collector":
        return "认证收藏者";
      case "parent":
        return "家长用户";
      default:
        if (cleanText(profile.user_type) === "business") return "认证机构成员";
    }
  }
  switch (cleanText(profile.user_role)) {
    case "artist":
      return "艺术创作者";
    case "student":
      return "艺术申请者";
    case "collector":
      return "艺术爱好者";
    case "parent":
      return "家长用户";
    default:
      return "社区用户";
  }
}

function profileKind(profile: Row) {
  switch (cleanText(profile.user_role)) {
    case "artist":
      return "artist";
    case "student":
    case "parent":
      return "student";
    case "mentor":
    case "advisor":
      return "mentor";
    default:
      return "user";
  }
}

function publicBio(profile: Row, name: string) {
  const bio =
    cleanText(profile.bio) ||
    cleanText(profile.introduction) ||
    cleanText(profile.description);
  if (bio) return bio;
  switch (profileKind(profile)) {
    case "artist":
      return `${name} 正在展示作品、展览记录和创作观点。`;
    case "student":
      return `${name} 关注作品集、申请经验和院校选择。`;
    case "mentor":
      return `${name} 分享作品集案例、申请判断和面试经验。`;
    default:
      return `${name} 参与艺术社区讨论，收藏作品与案例。`;
  }
}

function publicHandle(profile: Row, name: string, userId: string) {
  const raw = cleanText(profile.handle) || cleanText(profile.username);
  if (raw) return raw.startsWith("@") ? raw : `@${raw.replace(/\s+/g, "_")}`;
  const seed = (cleanText(profile.nickname) || name || userId.slice(0, 8))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `@artsee_${seed || userId.slice(0, 8)}`;
}

function sanitizeProfile(profile: Row, userId: string) {
  const name = cleanText(profile.nickname) || cleanText(profile.display_name) || "Artsee 用户";
  const tags = [
    ...stringList(profile.target_directions),
    ...stringList(profile.target_majors),
    ...stringList(profile.favorite_artists_or_styles),
  ].slice(0, 8);
  return {
    id: userId,
    nickname: name,
    avatar_url: cleanText(profile.avatar_url) || null,
    bio: publicBio(profile, name),
    handle: publicHandle(profile, name, userId),
    role_label: roleLabel(profile),
    kind: profileKind(profile),
    user_type: cleanText(profile.user_type) || null,
    user_role: cleanText(profile.user_role) || null,
    is_verified: profile.is_verified === true,
    creator_level: cleanText(profile.creator_level) || "none",
    location:
      cleanText(profile.location) ||
      cleanText(profile.city_preference) ||
      null,
    tags,
    created_at: profile.created_at ?? null,
    updated_at: profile.updated_at ?? null,
  };
}

function representativeImage(row: Row) {
  const images = row.images;
  if (Array.isArray(images)) {
    const first = images.map((item) => cleanText(item)).find(Boolean);
    if (first) return first;
  }
  return cleanText(row.cover_url) || cleanText(row.image_url) || null;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const userId = cleanText(id);
    if (!userId) {
      return NextResponse.json({ success: false, error: "无效用户 ID" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) return errorResponse(profileError);
    if (!profile || ["banned", "disabled"].includes(cleanText(profile.status))) {
      return notFoundResponse();
    }

    const currentUser = await getUserFromBearer(req);
    let isFriend = false;
    if (currentUser?.id && currentUser.id !== userId) {
      const { data: friendship, error: friendshipError } = await supabase
        .from("user_friends")
        .select("status")
        .eq("user_id", currentUser.id)
        .eq("friend_id", userId)
        .eq("status", "active")
        .maybeSingle();
      if (friendshipError) return errorResponse(friendshipError);
      isFriend = friendship?.status === "active";
    }

    const [{ data: artworkRows, error: artworkError, count: artworkCount }, { data: postRows, error: postError, count: postCount }] =
      await Promise.all([
        supabase
          .from("artworks")
          .select("id,title,category,images,description,created_at,artwork_stats(views,likes,favorites)", { count: "exact" })
          .eq("user_id", userId)
          .eq("status", "published")
          .eq("visibility", "public")
          .order("created_at", { ascending: false })
          .range(0, 8),
        supabase
          .from("community_posts")
          .select("id,title,body,image_urls,like_count,comment_count,view_count,created_at,metadata", { count: "exact" })
          .eq("author_id", userId)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .range(0, 3),
      ]);

    if (artworkError) return errorResponse(artworkError);
    if (postError) return errorResponse(postError);

    const publicProfile = sanitizeProfile(profile as Row, userId);
    const artworks = ((artworkRows ?? []) as Row[]).map((row) => ({
      id: row.id,
      title: cleanText(row.title) || "未命名作品",
      category: cleanText(row.category) || null,
      image_url: representativeImage(row),
      description: cleanText(row.description) || null,
      created_at: row.created_at ?? null,
      stats: Array.isArray(row.artwork_stats) ? row.artwork_stats[0] ?? null : row.artwork_stats ?? null,
    }));

    const activities = ((postRows ?? []) as Row[]).map((row) => ({
      id: row.id,
      title: cleanText(row.title) || "社区动态",
      body: cleanText(row.body) || null,
      image_url: Array.isArray(row.image_urls)
        ? row.image_urls.map((item) => cleanText(item)).find(Boolean) ?? null
        : null,
      like_count: intValue(row.like_count),
      comment_count: intValue(row.comment_count),
      view_count: intValue(row.view_count),
      created_at: row.created_at ?? null,
      metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    }));

    return NextResponse.json({
      success: true,
      data: {
        user: publicProfile,
        public_profile: publicProfile,
        stats: {
          followers: intValue(profile.followers_count ?? profile.follower_count, 0),
          following: intValue(profile.following_count, 0),
          profile_views: intValue(profile.profile_views ?? profile.view_count ?? profile.views_count, 0),
          works: intValue(profile.works_count, artworkCount ?? artworks.length),
          posts: intValue(profile.content_count, postCount ?? activities.length),
          answers: intValue(profile.answer_count, 0),
        },
        friendship: {
          is_self: currentUser?.id === userId,
          is_friend: isFriend,
          status: isFriend ? "active" : "none",
          im_identifier: buildTencentImIdentifier(userId),
        },
        artworks,
        activities,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
