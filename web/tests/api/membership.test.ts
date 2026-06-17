import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as getMembership } from "@/app/api/v1/me/membership/route";
import { POST as upgradeMembership } from "@/app/api/v1/me/membership/upgrade/route";

const profiles = new Map<string, Record<string, unknown>>();
let lastOrderInsert: Record<string, unknown> | null = null;

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: async (req: NextRequest) => {
    const h = req.headers.get("authorization");
    if (h === "Bearer valid-token") return { id: "user-123" } as any;
    return null;
  },
}));

vi.mock("@/lib/api/payment-checkout", () => ({
  createCheckoutSession: async (order: Record<string, unknown>) => ({
    provider: "internal",
    checkoutUrl: `/orders/${order.id}`,
    checkoutSessionId: null,
    paymentIntentId: null,
    customerId: null,
  }),
}));

class QueryStub {
  private id: string | null = null;
  private readonly table: string;

  constructor(table: string) {
    this.table = table;
  }

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    if (field === "id") this.id = value?.toString() ?? null;
    return this;
  }

  async maybeSingle() {
    if (this.table !== "user_profiles") return { data: null, error: null };
    return {
      data: this.id ? profiles.get(this.id) ?? null : null,
      error: null,
    };
  }

  insert(payload: Record<string, unknown>) {
    lastOrderInsert = payload;
    return {
      select: () => ({
        single: async () => ({
          data: {
            id: "order-123",
            ...payload,
          },
          error: null,
        }),
      }),
    };
  }

  update(payload: Record<string, unknown>) {
    return {
      eq: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({
              data: {
                id: "order-123",
                ...lastOrderInsert,
                ...payload,
              },
              error: null,
            }),
          }),
        }),
      }),
    };
  }
}

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: (table: string) => new QueryStub(table),
  }),
}));

describe("GET /api/v1/me/membership", () => {
  it("未授权返回 401", async () => {
    const req = new NextRequest("http://localhost/api/v1/me/membership");
    const res = await getMembership(req);
    expect(res.status).toBe(401);
  });

  it("返回当前用户有效会员状态", async () => {
    profiles.set("user-123", {
      id: "user-123",
      membership_status: "member",
      membership_started_at: "2026-06-14T12:00:00.000Z",
      membership_expires_at: "2027-07-14T12:00:00.000Z",
    });
    const req = new NextRequest("http://localhost/api/v1/me/membership", {
      headers: { authorization: "Bearer valid-token" },
    });
    const res = await getMembership(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.is_member).toBe(true);
    expect(body.data.status).toBe("member");
  });

  it("会员过期后返回 expired 且不再视为会员", async () => {
    profiles.set("user-123", {
      id: "user-123",
      membership_status: "member",
      membership_started_at: "2020-01-01T00:00:00.000Z",
      membership_expires_at: "2020-02-01T00:00:00.000Z",
    });
    const req = new NextRequest("http://localhost/api/v1/me/membership", {
      headers: { authorization: "Bearer valid-token" },
    });
    const res = await getMembership(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.is_member).toBe(false);
    expect(body.data.status).toBe("expired");
    expect(body.data.stored_status).toBe("member");
  });
});

describe("POST /api/v1/me/membership/upgrade", () => {
  it("按 monthly plan 创建月度会员 checkout 订单", async () => {
    process.env.MEMBERSHIP_MONTHLY_AMOUNT_TOTAL = "19900";
    lastOrderInsert = null;
    const req = new NextRequest("http://localhost/api/v1/me/membership/upgrade", {
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: JSON.stringify({ plan: "monthly" }),
    });
    const res = await upgradeMembership(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.plan).toBe("monthly");
    expect(body.data.productType).toBe("membership_monthly");
    expect(body.data.checkoutUrl).toBe("/orders/order-123");
    expect(lastOrderInsert).toMatchObject({
      user_id: "user-123",
      item_type: "membership_monthly",
      product_type: "membership_monthly",
      amount_total: 19900,
    });
  });
});
