import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as getImConfig } from "@/app/api/v1/im/config/route";
import {
  buildTencentImIdentifier,
  generateTencentImUserSig,
} from "@/lib/api/tencent-im";

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: async (req: NextRequest) => {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/, "");
    if (!token) return null;
    return { id: "user-123" };
  },
}));

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { nickname: "Artsee开发者", avatar_url: "https://example.com/a.png" },
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

function getReq(token = "valid-token") {
  return new NextRequest("http://localhost/api/v1/im/config", {
    method: "GET",
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

describe("Tencent IM config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("requires login", async () => {
    const res = await getImConfig(getReq(""));
    expect(res.status).toBe(401);
  });

  it("returns missing config as 503", async () => {
    vi.stubEnv("TENCENT_IM_SDK_APP_ID", "");
    vi.stubEnv("TENCENT_IM_SECRET_KEY", "");

    const res = await getImConfig(getReq());
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.missing).toContain("TENCENT_IM_SDK_APP_ID");
    expect(body.missing).toContain("TENCENT_IM_SECRET_KEY");
  });

  it("generates a UserSig payload for the current user", async () => {
    vi.stubEnv("TENCENT_IM_SDK_APP_ID", "1600000000");
    vi.stubEnv("TENCENT_IM_SECRET_KEY", "test-secret-with-enough-length");
    vi.stubEnv("TENCENT_IM_SKIP_ACCOUNT_IMPORT", "1");
    vi.stubEnv("TENCENT_IM_USER_SIG_EXPIRES_SECONDS", "3600");
    vi.useFakeTimers({ now: new Date("2026-06-24T12:00:00.000Z") });

    const res = await getImConfig(getReq());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.sdk_app_id).toBe(1600000000);
    expect(body.data.identifier).toBe("artsee_user-123");
    expect(body.data.user_sig).toEqual(expect.any(String));
    expect(body.data.user_sig.length).toBeGreaterThan(100);
    expect(body.data.expires_in).toBe(3600);
    expect(body.data.account_sync).toBe("skipped");
  });

  it("sanitizes identifiers and generates deterministic sigs", () => {
    const identifier = buildTencentImIdentifier("user/a b:c");
    const sig = generateTencentImUserSig({
      sdkAppId: 1600000000,
      secretKey: "test-secret-with-enough-length",
      identifier,
      expireSeconds: 3600,
      nowSeconds: 1782302400,
    });

    expect(identifier).toBe("artsee_user_a_b_c");
    expect(sig).toEqual(expect.any(String));
    expect(sig).not.toContain("+");
    expect(sig).not.toContain("/");
    expect(sig).not.toContain("=");
  });
});
