import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as postCommunity } from "@/app/api/v1/community/posts/route";
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
