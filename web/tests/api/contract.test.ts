import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as postCommunity } from "@/app/api/v1/community/posts/route";
import { GET as getCommunityHotTopics } from "@/app/api/v1/community/hot-topics/route";
import { POST as postAiSearch } from "@/app/api/v1/ai/schools/search/route";

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: (table: string) => {
      if (table === "programs") {
        return {
          select: () => ({
            eq: () => ({
              limit: async () => ({ data: [], error: null }),
            }),
          }),
        };
      }
      if (table === "community_posts") {
        return {
          insert: () => ({
            select: () => ({
              single: async () => ({ data: { id: "x" }, error: null }),
            }),
          }),
        };
      }
      if (table === "community_hot_topics") {
        const query: any = {};
        query.select = () => query;
        query.eq = () => query;
        query.order = () => query;
        query.range = async () => ({
          data: [
            {
              id: "topic-1",
              slug: "ai-art-award-progress-or-cheating",
              tag: "🔥 争议",
              title: "AI绘画拿大奖，这是艺术的进步还是作弊？",
              category: "行业就业",
              participant_count: 156,
              sort_order: 1,
              is_pinned: true,
              answers: [],
              metadata: { theme: "AI科技" },
              created_at: "2026-06-10T00:00:00Z",
            },
          ],
          count: 1,
          error: null,
        });
        return query;
      }
      return { select: () => ({ eq: () => ({}) }) };
    },
  }),
}));

describe("community POST", () => {
  it("未带 Bearer 返回 401", async () => {
    const req = new NextRequest("http://localhost/api/v1/community/posts", {
      method: "POST",
      body: JSON.stringify({ title: "t", body: "b", image_urls: [] }),
    });
    const res = await postCommunity(req);
    expect(res.status).toBe(401);
  });
});

describe("community hot topics", () => {
  it("返回已发布热议话题列表", async () => {
    const req = new NextRequest("http://localhost/api/v1/community/hot-topics?limit=3");
    const res = await getCommunityHotTopics(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
    expect(body.data[0].slug).toBe("ai-art-award-progress-or-cheating");
  });
});

describe("AI schools search", () => {
  it("无 query 返回 400", async () => {
    const req = new NextRequest("http://localhost/api/v1/ai/schools/search", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await postAiSearch(req);
    expect(res.status).toBe(400);
  });

  it("未配置 API Key 返回 503", async () => {
    const prevKey = process.env.OPENAI_API_KEY;
    const prevMoon = process.env.MOONSHOT_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.MOONSHOT_API_KEY;

    const req = new NextRequest("http://localhost/api/v1/ai/schools/search", {
      method: "POST",
      body: JSON.stringify({ query: "英国插画硕士" }),
    });
    const res = await postAiSearch(req);
    expect(res.status).toBe(503);

    if (prevKey !== undefined) process.env.OPENAI_API_KEY = prevKey;
    if (prevMoon !== undefined) process.env.MOONSHOT_API_KEY = prevMoon;
  });
});
