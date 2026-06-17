import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as createCheckout } from "@/app/api/v1/payments/checkout/route";

let insertedOrders: Record<string, unknown>[] = [];

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: async (req: NextRequest) => {
    const h = req.headers.get("authorization");
    if (h === "Bearer valid-token") return { id: "user-123" } as { id: string };
    return null;
  },
}));

class QueryStub {
  constructor(private readonly table: string) {}

  insert(payload: Record<string, unknown>) {
    const row = {
      id: `${this.table}-1`,
      ...payload,
    };
    insertedOrders.push(row);
    return {
      select: () => ({
        single: async () => ({ data: row, error: null }),
      }),
    };
  }
}

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: (table: string) => new QueryStub(table),
  }),
}));

function req(body: Record<string, unknown>, token = "valid-token") {
  return new NextRequest("http://localhost/api/v1/payments/checkout", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/payments/checkout", () => {
  it("creates checkout orders for regular products", async () => {
    insertedOrders = [];
    const res = await createCheckout(
      req({
        subject: "作品集评估",
        amount_total: 50000,
        product_type: "mentor_booking",
        item_id: "booking-1",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.checkoutUrl).toBe("/orders/orders-1");
    expect(insertedOrders[0]).toMatchObject({
      user_id: "user-123",
      item_type: "mentor_booking",
      product_type: "mentor_booking",
      amount_total: 50000,
    });
  });

  it("rejects reserved membership and organization subscription products", async () => {
    insertedOrders = [];
    const membership = await createCheckout(
      req({
        subject: "Artiqore 年度会员",
        amount_total: 100,
        product_type: "membership_yearly",
      })
    );
    const membershipBody = await membership.json();
    expect(membership.status).toBe(400);
    expect(membershipBody.error).toBe("该商品类型必须通过专用购买接口创建订单");

    const organization = await createCheckout(
      req({
        subject: "机构年费",
        amount_total: 100,
        item_type: "org_subscription",
      })
    );
    expect(organization.status).toBe(400);
    expect(insertedOrders).toHaveLength(0);
  });
});
