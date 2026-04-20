import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as postUpload } from "@/app/api/v1/upload/route";

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: async (req: NextRequest) => {
    const h = req.headers.get("authorization");
    if (h === "Bearer valid-token") {
      return { id: "user-123" } as any;
    }
    return null;
  },
}));

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    storage: {
      from: (bucket: string) => ({
        upload: vi.fn(async (_path: string, _bytes: Uint8Array, _opts: any) => ({
          error: null,
        })),
        getPublicUrl: (path: string) => ({
          data: {
            publicUrl: `https://nufrgmlhlfmhxsqbybfd.supabase.co/storage/v1/object/public/${bucket}/${path}`,
          },
        }),
      }),
    },
  }),
}));

describe("POST /api/v1/upload", () => {
  it("未带 Bearer Token 返回 401", async () => {
    const req = new NextRequest("http://localhost/api/v1/upload", {
      method: "POST",
    });
    const res = await postUpload(req);
    expect(res.status).toBe(401);
  });

  it("缺少文件返回 400", async () => {
    const form = new FormData();
    const req = new NextRequest("http://localhost/api/v1/upload", {
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: form,
    });
    const res = await postUpload(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("缺少文件");
  });

  it("不支持的文件类型返回 400", async () => {
    const form = new FormData();
    const blob = new Blob(["fake-pdf"], { type: "application/pdf" });
    form.append("file", new File([blob], "test.pdf", { type: "application/pdf" }));

    const req = new NextRequest("http://localhost/api/v1/upload", {
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: form,
    });
    const res = await postUpload(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("不支持的文件类型");
  });

  it("上传成功返回 200 和公开 URL", async () => {
    const form = new FormData();
    const blob = new Blob(["fake-image"], { type: "image/png" });
    form.append("file", new File([blob], "test.png", { type: "image/png" }));
    form.append("folder", "community");

    const req = new NextRequest("http://localhost/api/v1/upload", {
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: form,
    });
    const res = await postUpload(req);
    const json = await res.json();
    if (res.status !== 200) console.log("DEBUG upload response:", res.status, json);
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.url).toContain("user-123/community/");
    expect(json.url).toContain("test.png");
  });
});
