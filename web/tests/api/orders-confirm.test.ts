import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as confirmOrder } from "@/app/api/v1/orders/[id]/confirm/route";

type Row = Record<string, unknown>;
type Ctx = { params: Promise<{ id: string }> };

const USER_ID = "10000000-0000-4000-8000-000000000001";
const INTERNAL_ORDER_ID = "20000000-0000-4000-8000-000000000001";
const EXTERNAL_ORDER_ID = "20000000-0000-4000-8000-000000000002";
const markOrderPaid = vi.hoisted(() => vi.fn());

let orders: Row[] = [];

function resetDb() {
  markOrderPaid.mockReset();
  markOrderPaid.mockImplementation(async (_supabase: unknown, existing: Row) => ({
    order: { ...existing, status: "paid" },
    mentor: null,
    membership: null,
    organizationSubscription: null,
  }));
  orders = [
    {
      id: INTERNAL_ORDER_ID,
      user_id: USER_ID,
      status: "checkout_created",
      provider: "internal",
    },
    {
      id: EXTERNAL_ORDER_ID,
      user_id: USER_ID,
      status: "checkout_created",
      provider: "stripe",
    },
  ];
}

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: async (req: NextRequest) => {
    const h = req.headers.get("authorization");
    if (h === "Bearer valid-token") return { id: USER_ID } as { id: string };
    return null;
  },
}));

vi.mock("@/lib/api/order-payments", () => ({
  isOrderPayable: (status: unknown) =>
    ["pending", "checkout_created", "failed"].includes(String(status || "pending")),
  markOrderPaid,
}));

class QueryStub {
  private filters: Array<{ field: string; value: unknown }> = [];

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, value });
    return this;
  }

  async maybeSingle() {
    return {
      data: orders.find((row) => this.matches(row)) ?? null,
      error: null,
    };
  }

  private matches(row: Row) {
    return this.filters.every(({ field, value }) => row[field] === value);
  }
}

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: () => new QueryStub(),
  }),
}));

function req() {
  return new NextRequest("http://localhost/api/v1/orders/confirm", {
    method: "POST",
    headers: { authorization: "Bearer valid-token" },
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) } satisfies Ctx;
}

describe("POST /api/v1/orders/:id/confirm", () => {
  beforeEach(resetDb);

  it("confirms internal checkout orders", async () => {
    const res = await confirmOrder(req(), ctx(INTERNAL_ORDER_ID));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("paid");
    expect(markOrderPaid).toHaveBeenCalledTimes(1);
  });

  it("does not allow users to manually confirm external provider orders", async () => {
    const res = await confirmOrder(req(), ctx(EXTERNAL_ORDER_ID));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("外部支付订单需等待支付回调确认");
    expect(markOrderPaid).not.toHaveBeenCalled();
  });
});
