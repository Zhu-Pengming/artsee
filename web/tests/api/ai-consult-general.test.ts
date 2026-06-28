import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as consult } from "@/app/api/v1/ai/consult/route";

const mocks = vi.hoisted(() => ({
  getUserFromBearer: vi.fn(),
  runConsultStages: vi.fn(),
  generate: vi.fn(),
  fireRecordFromTurn: vi.fn(),
  logChatInteraction: vi.fn(),
}));

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: mocks.getUserFromBearer,
}));

vi.mock("@/lib/memory", () => ({
  fireRecordFromTurn: mocks.fireRecordFromTurn,
}));

vi.mock("@/lib/logging/chat-logger", () => ({
  logChatInteraction: mocks.logChatInteraction,
}));

vi.mock("@/lib/pipelines/consult-pipeline", () => ({
  runConsultStages: mocks.runConsultStages,
  generate: mocks.generate,
}));

function req(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/v1/ai/consult", {
    method: "POST",
    headers: { authorization: "Bearer valid-token" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/ai/consult general protocol", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserFromBearer.mockResolvedValue({ id: "user-1" });
    mocks.runConsultStages.mockImplementation(async (input) => ({
      systemPrompt: "base prompt",
      userMessage: input.query,
      sources: [
        {
          schoolName: "Artsee",
          heading: "General",
          similarity: 0.87,
          chunkId: "chunk-1",
        },
      ],
      intent: "open_info",
      lowConfidence: false,
      retrievedChunkIds: ["chunk-1"],
    }));
    mocks.generate.mockImplementation(async () => ({ answer: "通用艺术助手回答" }));
  });

  it("accepts messages, persona, intent, and bounded UI context", async () => {
    const res = await consult(
      req({
        query: "帮我优化艺术家主页",
        mode: "chat",
        persona: "artist",
        intent: "artist_profile",
        userProfile: { displayName: "小王" },
        context: {
          surface: "web_artist_profile",
          authToken: "should-not-enter-prompt",
          currentTab: "works",
        },
        messages: [
          { role: "assistant", content: "你好，我可以帮你梳理展示。" },
          { role: "user", content: "帮我优化艺术家主页" },
        ],
      })
    );
    const body = await res.json();
    const pipelineInput = mocks.runConsultStages.mock.calls[0][0];
    const generatedStages = mocks.generate.mock.calls[0][0];

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      query: "帮我优化艺术家主页",
      answer: "通用艺术助手回答",
      mode: "chat",
      persona: "artist",
      requestedIntent: "artist_profile",
      detectedIntent: "open_info",
    });
    expect(pipelineInput).toMatchObject({
      query: "帮我优化艺术家主页",
      userId: "user-1",
      mode: "chat",
      history: [{ role: "assistant", content: "你好，我可以帮你梳理展示。" }],
    });
    expect(pipelineInput.userProfile).toMatchObject({
      aiProfileKey: "artist",
      ai_profile_key: "artist",
      userRole: "artist",
      displayName: "小王",
    });
    expect(generatedStages.systemPrompt).toContain("【本轮用户身份】artist");
    expect(generatedStages.systemPrompt).toContain("【本轮场景】artist_profile");
    expect(generatedStages.systemPrompt).toContain("web_artist_profile");
    expect(generatedStages.systemPrompt).not.toContain("should-not-enter-prompt");
  });

  it("keeps the legacy query payload compatible", async () => {
    const res = await consult(req({ query: "RCA 怎么样", mode: "short" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.answer).toBe("通用艺术助手回答");
    expect(body.data.answer).toBe("通用艺术助手回答");
    expect(mocks.runConsultStages.mock.calls[0][0]).toMatchObject({
      query: "RCA 怎么样",
      mode: "short",
    });
  });

  it("rejects empty requests", async () => {
    const res = await consult(req({ messages: [] }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Query is required");
  });
});
