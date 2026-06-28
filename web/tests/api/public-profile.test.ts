import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as getPublicProfile } from "@/app/api/v1/users/[id]/public-profile/route";

type Row = Record<string, unknown>;

const db: Record<string, Row[]> = {
  user_profiles: [],
  artworks: [],
  community_posts: [],
};

function resetDb() {
  db.user_profiles = [
    {
      id: "user-1",
      nickname: "林清越",
      avatar_url: "https://example.com/avatar.jpg",
      bio: "数字绘画与空间装置创作者",
      handle: "lin_art",
      user_type: "personal",
      user_role: "artist",
      is_verified: true,
      creator_level: "creator",
      followers_count: 1280,
      following_count: 48,
      profile_views: 9200,
      works_count: 12,
      content_count: 5,
      target_directions: ["数字艺术", "装置"],
      status: "active",
      created_at: "2026-06-01T00:00:00.000Z",
    },
    {
      id: "banned-user",
      nickname: "不可见用户",
      status: "banned",
    },
  ];
  db.artworks = [
    {
      id: "art-1",
      user_id: "user-1",
      title: "梦境切片",
      category: "digital",
      images: ["https://example.com/art.jpg"],
      description: "代表作",
      status: "published",
      visibility: "public",
      created_at: "2026-06-12T00:00:00.000Z",
      artwork_stats: { views: 10, likes: 2, favorites: 1 },
    },
    {
      id: "art-private",
      user_id: "user-1",
      title: "隐藏作品",
      images: ["https://example.com/private.jpg"],
      status: "draft",
      visibility: "private",
    },
  ];
  db.community_posts = [
    {
      id: "post-1",
      author_id: "user-1",
      title: "创作过程更新",
      body: "今天整理了展览现场图。",
      image_urls: ["https://example.com/post.jpg"],
      status: "published",
      like_count: 3,
      comment_count: 1,
      view_count: 30,
      created_at: "2026-06-13T00:00:00.000Z",
      metadata: { kind: "worklog" },
    },
  ];
}

class QueryStub {
  private filters: Array<{ field: string; value: unknown }> = [];
  private rangeStart = 0;
  private rangeEnd: number | null = null;

  constructor(private readonly table: string) {}

  select(_columns?: string, _options?: unknown) {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, value });
    return this;
  }

  order() {
    return this;
  }

  range(start: number, end: number) {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this;
  }

  async maybeSingle() {
    return { data: this.findRows()[0] ?? null, error: null };
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: Row[]; count: number; error: null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    const rows = this.findRows();
    const sliced =
      this.rangeEnd == null
        ? rows
        : rows.slice(this.rangeStart, this.rangeEnd + 1);
    return Promise.resolve({ data: sliced, count: rows.length, error: null }).then(
      onfulfilled,
      onrejected
    );
  }

  private findRows() {
    return (db[this.table] ?? []).filter((row) =>
      this.filters.every(({ field, value }) => row[field] === value)
    );
  }
}

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: (table: string) => new QueryStub(table),
  }),
}));

function req(id: string) {
  return {
    request: new NextRequest(`http://localhost/api/v1/users/${id}/public-profile`),
    ctx: { params: Promise.resolve({ id }) },
  };
}

describe("public user profile API", () => {
  beforeEach(resetDb);

  it("returns a sanitized public profile with artworks and activities", async () => {
    const { request, ctx } = req("user-1");
    const res = await getPublicProfile(request, ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.public_profile.nickname).toBe("林清越");
    expect(body.data.public_profile.handle).toBe("@lin_art");
    expect(body.data.public_profile.role_label).toBe("认证艺术家");
    expect(body.data.public_profile.admin_note).toBeUndefined();
    expect(body.data.stats.works).toBe(12);
    expect(body.data.artworks).toHaveLength(1);
    expect(body.data.artworks[0].image_url).toBe("https://example.com/art.jpg");
    expect(body.data.activities[0].title).toBe("创作过程更新");
  });

  it("hides banned or missing users", async () => {
    const banned = req("banned-user");
    expect((await getPublicProfile(banned.request, banned.ctx)).status).toBe(404);

    const missing = req("missing-user");
    expect((await getPublicProfile(missing.request, missing.ctx)).status).toBe(404);
  });
});
