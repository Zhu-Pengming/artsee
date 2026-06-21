import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as signCosUpload } from "@/app/api/v1/uploads/cos/sign/route";
import { POST as completeCosUpload } from "@/app/api/v1/uploads/cos/complete/route";
import { POST as auditContent } from "@/app/api/v1/content/audit/route";

const mockDb = vi.hoisted(() => ({
  inserts: [] as Array<{ table: string; row: Record<string, unknown> }>,
}));

vi.mock("@/lib/api/authz", () => ({
  requireUser: async (req: NextRequest) => {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/, "");
    if (!token) {
      return {
        response: new Response(
          JSON.stringify({ success: false, error: "未授权" }),
          { status: 401 }
        ),
      };
    }
    return { user: { id: "user-123" }, profile: { role: "user" } };
  },
}));

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: (table: string) => ({
      insert: async (row: Record<string, unknown>) => {
        mockDb.inserts.push({ table, row });
        return { error: null };
      },
    }),
  }),
}));

function postReq(path: string, body?: Record<string, unknown>, token = "valid-token") {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

function stubTencentEnv() {
  vi.stubEnv("TENCENT_CLOUD_SECRET_ID", "secret-id");
  vi.stubEnv("TENCENT_CLOUD_SECRET_KEY", "secret-key");
  vi.stubEnv("TENCENT_CLOUD_REGION", "ap-guangzhou");
  vi.stubEnv("TENCENT_COS_BUCKET", "artsee-test-1250000000");
  vi.stubEnv("TENCENT_COS_REGION", "ap-guangzhou");
  vi.stubEnv("TENCENT_COS_PUBLIC_BASE_URL", "https://assets.example.com");
}

describe("Tencent COS upload signing", () => {
  beforeEach(() => {
    mockDb.inserts = [];
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("requires login", async () => {
    const res = await signCosUpload(
      postReq("/api/v1/uploads/cos/sign", {
        file_name: "art.png",
        content_type: "image/png",
        size: 12,
      }, "")
    );
    expect(res.status).toBe(401);
  });

  it("returns 503 when Tencent COS env is missing", async () => {
    vi.stubEnv("TENCENT_CLOUD_SECRET_ID", "");
    vi.stubEnv("TENCENT_CLOUD_SECRET_KEY", "");
    const res = await signCosUpload(
      postReq("/api/v1/uploads/cos/sign", {
        file_name: "art.png",
        content_type: "image/png",
        size: 12,
      })
    );
    const body = await res.json();
    expect(res.status).toBe(503);
    expect(body.missing).toContain("TENCENT_CLOUD_SECRET_ID");
  });

  it("returns a scoped signed PUT upload for the current user", async () => {
    stubTencentEnv();
    vi.useFakeTimers({ now: new Date("2026-06-18T12:00:00.000Z") });

    const res = await signCosUpload(
      postReq("/api/v1/uploads/cos/sign", {
        file_name: "作品 1.png",
        content_type: "image/png",
        scene: "community",
        size: 1024,
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.provider).toBe("tencent_cos");
    expect(body.data.method).toBe("PUT");
    expect(body.data.key).toMatch(/^uploads\/user-123\/community\//);
    expect(body.data.public_url).toContain("https://assets.example.com/uploads/user-123/community/");
    expect(body.data.headers.Authorization).toContain("q-sign-algorithm=sha1");
    expect(body.data.headers["Content-Type"]).toBe("image/png");
  });

  it("records a completed COS upload into upload_files", async () => {
    const res = await completeCosUpload(
      postReq("/api/v1/uploads/cos/complete", {
        key: "uploads/user-123/community/1_art.png",
        url: "https://assets.example.com/uploads/user-123/community/1_art.png",
        bucket: "artsee-test-1250000000",
        file_type: "image/png",
        scene: "community",
        size: 1024,
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockDb.inserts[0]).toEqual({
      table: "upload_files",
      row: {
        user_id: "user-123",
        file_url: "https://assets.example.com/uploads/user-123/community/1_art.png",
        file_type: "image/png",
        scene: "community",
        size: 1024,
        provider: "tencent_cos",
        bucket: "artsee-test-1250000000",
        object_key: "uploads/user-123/community/1_art.png",
      },
    });
  });

  it("rejects completion records for another user's key", async () => {
    const res = await completeCosUpload(
      postReq("/api/v1/uploads/cos/complete", {
        key: "uploads/other-user/community/1_art.png",
        url: "https://assets.example.com/uploads/other-user/community/1_art.png",
      })
    );
    expect(res.status).toBe(403);
  });
});

describe("Tencent content audit", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("requires text or images", async () => {
    const res = await auditContent(
      postReq("/api/v1/content/audit", {
        text: "",
        image_urls: [],
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 503 when Tencent credentials are missing", async () => {
    vi.stubEnv("TENCENT_CLOUD_SECRET_ID", "");
    vi.stubEnv("TENCENT_CLOUD_SECRET_KEY", "");
    const res = await auditContent(
      postReq("/api/v1/content/audit", {
        text: "测试内容",
      })
    );
    expect(res.status).toBe(503);
  });

  it("merges text and image moderation into the strictest audit status", async () => {
    stubTencentEnv();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            Response: {
              Suggestion: "Pass",
              Label: "Normal",
              Score: 0,
              RequestId: "text-request",
            },
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            Response: {
              Suggestion: "Block",
              Label: "Illegal",
              SubLabel: "Sensitive",
              Score: 98,
              RequestId: "image-request",
            },
          }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    const res = await auditContent(
      postReq("/api/v1/content/audit", {
        text: "一段正常文字",
        image_urls: ["https://assets.example.com/uploads/user-123/community/1.png"],
        scene: "community_post",
        data_id: "post-draft-1",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(body.data.suggestion).toBe("block");
    expect(body.data.audit_status).toBe("rejected");
    expect(body.data.items).toHaveLength(2);
    expect(body.data.items[1]).toMatchObject({
      type: "image",
      label: "Illegal",
      sub_label: "Sensitive",
      score: 98,
      request_id: "image-request",
    });
  });
});
