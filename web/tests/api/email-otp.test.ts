import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocked = vi.hoisted(() => ({
  users: [] as Array<{ id?: string; email?: string; email_confirmed_at?: string | null }>,
  sentOtp: null as Record<string, unknown> | null,
  verifiedOtp: null as Record<string, unknown> | null,
  updatedUser: null as { id: string; payload: Record<string, unknown> } | null,
}));

function buildServiceClientMock() {
  return {
    auth: {
      admin: {
        listUsers: async () => ({ data: { users: mocked.users }, error: null }),
        updateUserById: async (id: string, payload: Record<string, unknown>) => {
          mocked.updatedUser = { id, payload };
          return {
            data: { user: { id, email: "new@artsee.app" } },
            error: null,
          };
        },
      },
      signInWithPassword: async () => ({
        data: {
          session: {
            access_token: "token-1",
          },
        },
        error: null,
      }),
    },
    from: (table: string) => {
      if (table === "user_profiles") {
        return {
          upsert: () => ({
            select: () => ({
              maybeSingle: async () => ({
                data: { id: "user-1", nickname: "新用户" },
                error: null,
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };
}

function buildPublicAuthClientMock() {
  return {
    auth: {
      signInWithOtp: async (payload: Record<string, unknown>) => {
        mocked.sentOtp = payload;
        return { data: {}, error: null };
      },
      verifyOtp: async (payload: Record<string, unknown>) => {
        mocked.verifiedOtp = payload;
        return {
          data: {
            user: { id: "user-1", email: "new@artsee.app" },
            session: { access_token: "otp-token" },
          },
          error: null,
        };
      },
    },
  };
}

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => buildServiceClientMock(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => buildPublicAuthClientMock(),
}));

function jsonReq(path: string, body: Record<string, unknown>) {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Supabase email OTP signup flow", () => {
  beforeEach(() => {
    mocked.users = [];
    mocked.sentOtp = null;
    mocked.verifiedOtp = null;
    mocked.updatedUser = null;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("asks Supabase Auth to send a signup email OTP", async () => {
    const { POST } = await import("@/app/api/v1/auth/send-email-otp/route");
    const res = await POST(
      jsonReq("/api/v1/auth/send-email-otp", {
        email: "New@Artsee.App",
        nickname: "新用户",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.provider).toBe("supabase_auth");
    expect(body.code).toBeUndefined();
    expect(mocked.sentOtp).toMatchObject({
      email: "new@artsee.app",
      options: {
        shouldCreateUser: true,
        data: { nickname: "新用户", username: "新用户" },
      },
    });
  });

  it("rejects signup without email OTP", async () => {
    const { POST } = await import("@/app/api/v1/auth/signup/route");
    const res = await POST(
      jsonReq("/api/v1/auth/signup", {
        email: "new@artsee.app",
        password: "Artsee123!",
        nickname: "新用户",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("请填写邮箱验证码");
    expect(mocked.verifiedOtp).toBeNull();
  });

  it("sets password and profile after Supabase OTP verification", async () => {
    const { POST } = await import("@/app/api/v1/auth/signup/route");
    const res = await POST(
      jsonReq("/api/v1/auth/signup", {
        email: "new@artsee.app",
        password: "Artsee123!",
        nickname: "新用户",
        email_otp: "654321",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mocked.verifiedOtp).toMatchObject({
      email: "new@artsee.app",
      token: "654321",
      type: "email",
    });
    expect(mocked.updatedUser).toMatchObject({
      id: "user-1",
      payload: {
        password: "Artsee123!",
        email_confirm: true,
        user_metadata: { nickname: "新用户", username: "新用户" },
      },
    });
  });

  it("does not send signup OTP to an already confirmed email", async () => {
    mocked.users = [
      {
        id: "existing-user",
        email: "new@artsee.app",
        email_confirmed_at: "2026-06-25T00:00:00.000Z",
      },
    ];

    const { POST } = await import("@/app/api/v1/auth/send-email-otp/route");
    const res = await POST(
      jsonReq("/api/v1/auth/send-email-otp", {
        email: "new@artsee.app",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toBe("邮箱已被注册");
    expect(mocked.sentOtp).toBeNull();
  });
});
