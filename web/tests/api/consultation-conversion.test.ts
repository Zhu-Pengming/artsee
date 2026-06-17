import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as getConsultationConversion } from "@/app/api/v1/me/consultations/[id]/conversion/route";
import { GET as getServiceBooking } from "@/app/api/v1/me/service-bookings/[id]/route";
import { GET as getOrder } from "@/app/api/v1/orders/[id]/route";
import { POST as checkoutOrder } from "@/app/api/v1/orders/[id]/checkout/route";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const CONSULTATION_ID = "22222222-2222-4222-8222-222222222222";
const BOOKING_ID = "33333333-3333-4333-8333-333333333333";
const ORDER_ID = "44444444-4444-4444-8444-444444444444";
const OTHER_ORDER_ID = "55555555-5555-4555-8555-555555555555";

type Row = Record<string, unknown>;
type IdCtx = { params: Promise<{ id: string }> };

const db: Record<string, Row[]> = {
  consultations: [],
  service_bookings: [],
  orders: [],
};

function resetDb() {
  delete process.env.PAYMENT_PROVIDER;
  delete process.env.PAYMENT_CHECKOUT_ENDPOINT;
  delete process.env.PAYMENT_CHECKOUT_SECRET;
  db.consultations = [
    {
      id: CONSULTATION_ID,
      user_id: USER_ID,
      target_name: "皇家艺术学院",
      status: "converted",
    },
  ];
  db.service_bookings = [
    {
      id: BOOKING_ID,
      consultation_id: CONSULTATION_ID,
      student_user_id: USER_ID,
      title: "皇家艺术学院预约服务",
      status: "requested",
      consultation: db.consultations[0],
    },
  ];
  db.orders = [
    {
      id: ORDER_ID,
      user_id: USER_ID,
      order_no: "AQ202606120001",
      subject: "皇家艺术学院申请服务订单",
      item_type: "consultation",
      item_id: CONSULTATION_ID,
      amount_total: 990000,
      currency: "cny",
      status: "pending",
      provider: "internal",
    },
    {
      id: OTHER_ORDER_ID,
      user_id: USER_ID,
      order_no: "AQ202606120002",
      subject: "已支付订单",
      item_type: "consultation",
      item_id: CONSULTATION_ID,
      amount_total: 1200000,
      currency: "cny",
      status: "paid",
      provider: "internal",
    },
  ];
}

afterEach(() => {
  vi.unstubAllGlobals();
});

class QueryStub {
  private filters: Array<{ field: string; value: unknown }> = [];
  private patch: Row | null = null;

  constructor(private readonly table: string) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, value });
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  update(patch: Row) {
    this.patch = patch;
    return this;
  }

  async maybeSingle() {
    const row = this.findRow();
    return { data: row ?? null, error: null };
  }

  async single() {
    if (!this.patch) {
      const row = this.findRow();
      return { data: row ?? null, error: row ? null : { message: "not found" } };
    }
    const rows = db[this.table] ?? [];
    const index = rows.findIndex((row) => this.matches(row));
    if (index < 0) return { data: null, error: { message: "not found" } };
    rows[index] = { ...rows[index], ...this.patch };
    return { data: rows[index], error: null };
  }

  private findRow() {
    return (db[this.table] ?? []).find((row) => this.matches(row));
  }

  private matches(row: Row) {
    return this.filters.every(({ field, value }) => row[field] === value);
  }
}

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: async (req: NextRequest) => {
    const h = req.headers.get("authorization");
    if (h === "Bearer valid-token") return { id: USER_ID } as { id: string };
    return null;
  },
}));

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: (table: string) => new QueryStub(table),
  }),
}));

function req(path: string, method = "GET") {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: { authorization: "Bearer valid-token" },
  });
}

function anonReq(path: string, method = "GET") {
  return new NextRequest(`http://localhost${path}`, { method });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) } satisfies IdCtx;
}

describe("GET /api/v1/me/consultations/:id/conversion", () => {
  beforeEach(resetDb);

  it("未登录返回 401", async () => {
    const res = await getConsultationConversion(
      anonReq(`/api/v1/me/consultations/${CONSULTATION_ID}/conversion`),
      ctx(CONSULTATION_ID)
    );
    expect(res.status).toBe(401);
  });

  it("无效咨询 id 返回 400", async () => {
    const res = await getConsultationConversion(
      req("/api/v1/me/consultations/bad-id/conversion"),
      ctx("bad-id")
    );
    expect(res.status).toBe(400);
  });

  it("返回当前学生咨询对应的预约和订单", async () => {
    const res = await getConsultationConversion(
      req(`/api/v1/me/consultations/${CONSULTATION_ID}/conversion`),
      ctx(CONSULTATION_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.service_booking.id).toBe(BOOKING_ID);
    expect(body.data.order.id).toBe(ORDER_ID);
  });
});

describe("GET /api/v1/me/service-bookings/:id", () => {
  beforeEach(resetDb);

  it("未登录返回 401", async () => {
    const res = await getServiceBooking(
      anonReq(`/api/v1/me/service-bookings/${BOOKING_ID}`),
      ctx(BOOKING_ID)
    );
    expect(res.status).toBe(401);
  });

  it("返回当前学生自己的预约详情", async () => {
    const res = await getServiceBooking(
      req(`/api/v1/me/service-bookings/${BOOKING_ID}`),
      ctx(BOOKING_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(BOOKING_ID);
    expect(body.data.consultation.id).toBe(CONSULTATION_ID);
  });
});

describe("GET /api/v1/orders/:id", () => {
  beforeEach(resetDb);

  it("无效订单 id 返回 400", async () => {
    const res = await getOrder(req("/api/v1/orders/bad-id"), ctx("bad-id"));
    expect(res.status).toBe(400);
  });

  it("返回当前学生自己的订单详情", async () => {
    const res = await getOrder(req(`/api/v1/orders/${ORDER_ID}`), ctx(ORDER_ID));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(ORDER_ID);
    expect(body.data.user_id).toBe(USER_ID);
  });
});

describe("POST /api/v1/orders/:id/checkout", () => {
  beforeEach(resetDb);

  it("无效订单 id 返回 400", async () => {
    const res = await checkoutOrder(
      req("/api/v1/orders/bad-id/checkout", "POST"),
      ctx("bad-id")
    );
    expect(res.status).toBe(400);
  });

  it("已支付订单不可重复 checkout", async () => {
    const res = await checkoutOrder(
      req(`/api/v1/orders/${OTHER_ORDER_ID}/checkout`, "POST"),
      ctx(OTHER_ORDER_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toContain("不可支付");
  });

  it("为已有待支付订单创建 checkout 状态", async () => {
    const res = await checkoutOrder(
      req(`/api/v1/orders/${ORDER_ID}/checkout`, "POST"),
      ctx(ORDER_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.orderId).toBe(ORDER_ID);
    expect(body.data.status).toBe("checkout_created");
    expect(body.data.checkoutUrl).toBe(`/orders/${ORDER_ID}`);
    expect(db.orders.find((order) => order.id === ORDER_ID)?.status).toBe(
      "checkout_created"
    );
  });

  it("配置 provider endpoint 时创建外部 checkout 并写回 provider ids", async () => {
    process.env.PAYMENT_PROVIDER = "stripe";
    process.env.PAYMENT_CHECKOUT_ENDPOINT = "https://payments.example.test/checkout";
    process.env.PAYMENT_CHECKOUT_SECRET = "checkout-secret";
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          checkout_url: "https://checkout.example.test/session/cs_123",
          checkout_session_id: "cs_123",
          payment_intent_id: "pi_123",
          customer_id: "cus_123",
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await checkoutOrder(
      req(`/api/v1/orders/${ORDER_ID}/checkout`, "POST"),
      ctx(ORDER_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.checkoutUrl).toBe("https://checkout.example.test/session/cs_123");
    expect(fetchMock).toHaveBeenCalledOnce();
    const updated = db.orders.find((order) => order.id === ORDER_ID);
    expect(updated?.provider).toBe("stripe");
    expect(updated?.provider_checkout_session_id).toBe("cs_123");
    expect(updated?.provider_payment_intent_id).toBe("pi_123");
    expect(updated?.provider_customer_id).toBe("cus_123");
  });
});
