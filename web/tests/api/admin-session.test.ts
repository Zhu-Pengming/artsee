import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as getAdminSession } from "@/app/api/v1/admin/session/route";

vi.mock("@/lib/api/require-admin", () => ({
  requireAdmin: async (req: NextRequest) => {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/, "");
    if (token === "admin-token") {
      return { user: { id: "admin-user", email: "admin@example.com" } };
    }
    return {
      response: Response.json(
        { success: false, error: "需要管理员权限" },
        { status: 403 }
      ),
    };
  },
}));

function req(token?: string) {
  return new NextRequest("http://localhost/api/v1/admin/session", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

describe("GET /api/v1/admin/session", () => {
  it("rejects non-admin requests", async () => {
    const res = await getAdminSession(req());
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("需要管理员权限");
  });

  it("returns the current admin identity", async () => {
    const res = await getAdminSession(req("admin-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.user.id).toBe("admin-user");
    expect(body.user.email).toBe("admin@example.com");
  });
});
