import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as postUpload } from "@/app/api/v1/upload/route";
import { POST as signMaterial } from "@/app/api/v1/uploads/materials/sign/route";

const tokenUsers: Record<string, string> = {
  "valid-token": "user-123",
  "other-token": "user-456",
  "admin-token": "admin-1",
};

const profiles: Record<string, Record<string, unknown>> = {
  "user-123": { id: "user-123", role: "user", status: "active" },
  "user-456": { id: "user-456", role: "user", status: "active" },
  "admin-1": { id: "admin-1", role: "admin", status: "active" },
};

class QueryStub {
  private filters: Array<{ field: string; value: unknown }> = [];

  constructor(private readonly table: string) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, value });
    return this;
  }

  async maybeSingle() {
    if (this.table !== "user_profiles") return { data: null, error: null };
    const rows = Object.values(profiles);
    const row =
      rows.find((item) => this.filters.every(({ field, value }) => item[field] === value)) ??
      null;
    return { data: row, error: null };
  }

  async insert() {
    return { data: null, error: null };
  }
}

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: async (req: NextRequest) => {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/, "");
    const id = token ? tokenUsers[token] : null;
    return id ? ({ id } as { id: string }) : null;
  },
}));

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    storage: {
      from: (bucket: string) => ({
        upload: vi.fn(async () => ({
          error: null,
        })),
        getPublicUrl: (path: string) => ({
          data: {
            publicUrl: `https://nufrgmlhlfmhxsqbybfd.supabase.co/storage/v1/object/public/${bucket}/${path}`,
          },
        }),
        createSignedUrl: vi.fn(async (path: string) => ({
          data: {
            signedUrl: `https://nufrgmlhlfmhxsqbybfd.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=signed`,
          },
          error: null,
        })),
      }),
    },
    from: (table: string) => new QueryStub(table),
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

  it("补充材料场景支持 PDF 上传", async () => {
    const form = new FormData();
    const blob = new Blob(["fake-pdf"], { type: "application/pdf" });
    form.append("file", new File([blob], "portfolio.pdf", { type: "application/pdf" }));
    form.append("folder", "submission-materials/opportunities/opportunity-1");

    const req = new NextRequest("http://localhost/api/v1/upload", {
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: form,
    });
    const res = await postUpload(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.url).toContain("/submission-materials/user-123/submission-materials/opportunities/opportunity-1/");
    expect(json.url).toContain("portfolio.pdf");
  });

  it("合同存档场景支持 PDF 上传", async () => {
    const form = new FormData();
    const blob = new Blob(["fake-contract"], { type: "application/pdf" });
    form.append("file", new File([blob], "contract.pdf", { type: "application/pdf" }));
    form.append("folder", "contracts/org-1");

    const req = new NextRequest("http://localhost/api/v1/upload", {
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: form,
    });
    const res = await postUpload(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.url).toContain("/submission-materials/user-123/contracts/org-1/");
    expect(json.url).toContain("contract.pdf");
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

describe("POST /api/v1/uploads/materials/sign", () => {
  it("requires login", async () => {
    const req = new NextRequest("http://localhost/api/v1/uploads/materials/sign", {
      method: "POST",
      body: JSON.stringify({
        path: "user-123/submission-materials/opportunities/opportunity-1/portfolio.pdf",
      }),
    });
    const res = await signMaterial(req);
    expect(res.status).toBe(401);
  });

  it("signs the current user's own material", async () => {
    const req = new NextRequest("http://localhost/api/v1/uploads/materials/sign", {
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: JSON.stringify({
        url: "https://nufrgmlhlfmhxsqbybfd.supabase.co/storage/v1/object/public/submission-materials/user-123/submission-materials/opportunities/opportunity-1/portfolio.pdf",
      }),
    });
    const res = await signMaterial(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.path).toBe(
      "user-123/submission-materials/opportunities/opportunity-1/portfolio.pdf"
    );
    expect(json.signed_url).toContain("/object/sign/submission-materials/user-123/");
  });

  it("rejects another user's material for normal users", async () => {
    const req = new NextRequest("http://localhost/api/v1/uploads/materials/sign", {
      method: "POST",
      headers: { authorization: "Bearer other-token" },
      body: JSON.stringify({
        path: "user-123/submission-materials/opportunities/opportunity-1/portfolio.pdf",
      }),
    });
    const res = await signMaterial(req);
    expect(res.status).toBe(403);
  });

  it("allows admins to sign any submission material", async () => {
    const req = new NextRequest("http://localhost/api/v1/uploads/materials/sign", {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: JSON.stringify({
        path: "user-123/submission-materials/opportunities/opportunity-1/portfolio.pdf",
      }),
    });
    const res = await signMaterial(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.signed_url).toContain("/object/sign/submission-materials/user-123/");
  });
});
