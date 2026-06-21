import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as postCommunity } from "@/app/api/v1/community/posts/route";
import { GET as getCommunityHotTopics } from "@/app/api/v1/community/hot-topics/route";
import { POST as postAiSearch } from "@/app/api/v1/ai/schools/search/route";
import { POST as postSchoolCompare } from "@/app/api/v1/schools/compare/route";

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
      if (table === "schools") {
        return {
          select: () => ({
            in: async (_field: string, ids: string[]) => ({
              data: [
                {
                  id: ids[2],
                  name_zh: "中央圣马丁学院",
                  name_en: "Central Saint Martins",
                  city: "伦敦",
                  country: "英国",
                  qs_art_design_rank: 3,
                  program_count: 18,
                  portfolio_difficulty: 5,
                  acceptance_rate: 8,
                  career_resources_rating: 5,
                  tuition_usd_per_year: 36000,
                  city_cost_index: 5,
                },
                {
                  id: ids[0],
                  name_zh: "皇家艺术学院",
                  name_en: "Royal College of Art",
                  city: "伦敦",
                  country: "英国",
                  qs_art_design_rank: 1,
                  program_count: 26,
                  portfolio_difficulty: 5,
                  acceptance_rate: 7,
                  career_resources_rating: 5,
                  tuition_usd_per_year: 42000,
                  city_cost_index: 5,
                },
                {
                  id: ids[1],
                  name_zh: "罗德岛设计学院",
                  name_en: "RISD",
                  city: "普罗维登斯",
                  country: "美国",
                  qs_art_design_rank: 4,
                  program_count: 20,
                  portfolio_difficulty: 5,
                  acceptance_rate: 15,
                  career_resources_rating: 4,
                  tuition_usd_per_year: 58000,
                  city_cost_index: 4,
                },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "school_comparisons") {
        return {
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: "comparison-1" },
                error: null,
              }),
            }),
          }),
        };
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

describe("schools compare", () => {
  it("支持 3 所院校一起生成对比", async () => {
    const ids = [
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
      "33333333-3333-4333-8333-333333333333",
    ];
    const req = new NextRequest("http://localhost/api/v1/schools/compare", {
      method: "POST",
      body: JSON.stringify({ school_ids: ids }),
    });
    const res = await postSchoolCompare(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.schools).toHaveLength(3);
    expect(body.data.schools.map((school: any) => school.id)).toEqual(ids);
    expect(body.data.scores).toHaveLength(3);
    expect(body.data.rows.every((row: any) => row.values.length === 3)).toBe(true);
  });
});
