import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  GET as getOrderRefunds,
  POST as postOrderRefund,
} from "@/app/api/v1/orders/[id]/refunds/route";
import { GET as getAdminRefunds } from "@/app/api/v1/admin/refunds/route";
import { POST as reviewAdminRefund } from "@/app/api/v1/admin/refunds/[id]/review/route";

type Row = Record<string, unknown>;

const USER_ID = "50000000-0000-4000-8000-000000000001";
const ADMIN_ID = "50000000-0000-4000-8000-000000000002";
const ORDER_ID = "50000000-0000-4000-8000-000000000010";
const BOOKING_ID = "50000000-0000-4000-8000-000000000020";
const REFUND_ID = "50000000-0000-4000-8000-000000000030";

const tokenUsers: Record<string, string> = {
  user: USER_ID,
  admin: ADMIN_ID,
};

const db: Record<string, Row[]> = {
  user_profiles: [],
  orders: [],
  payment_refund_requests: [],
  mentor_bookings: [],
  mentor_earnings: [],
  notifications: [],
};

function resetDb() {
  delete process.env.PAYMENT_REFUND_ENDPOINT;
  delete process.env.PAYMENT_REFUND_SECRET;
  db.user_profiles = [
    { id: USER_ID, role: "user" },
    { id: ADMIN_ID, role: "admin" },
  ];
  db.orders = [
    {
      id: ORDER_ID,
      user_id: USER_ID,
      order_no: "AQ202606130002",
      subject: "作品集评估",
      item_type: "mentor_booking",
      item_id: BOOKING_ID,
      amount_total: 50000,
      currency: "cny",
      status: "paid",
      provider: "stripe",
      metadata: {},
    },
  ];
  db.payment_refund_requests = [];
  db.mentor_bookings = [
    {
      id: BOOKING_ID,
      payment_status: "paid",
    },
  ];
  db.mentor_earnings = [
    {
      id: "earning-1",
      order_id: ORDER_ID,
      status: "available",
      net_amount: 45000,
    },
  ];
  db.notifications = [];
}

afterEach(() => {
  vi.unstubAllGlobals();
});

class QueryStub {
  private filters: Array<{ field: string; value: unknown; op: "eq" | "in" }> = [];
  private patch: Row | null = null;
  private inserted: Row | Row[] | null = null;
  private rangeStart = 0;
  private rangeEnd: number | null = null;

  constructor(private readonly table: string) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, value, op: "eq" });
    return this;
  }

  in(field: string, values: unknown[]) {
    this.filters.push({ field, value: values, op: "in" });
    return this;
  }

  order() {
    return this;
  }

  range(start: number, end: number) {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this;
  }

  limit() {
    return this;
  }

  insert(row: Row | Row[]) {
    const rows = Array.isArray(row) ? row : [row];
    const inserted = rows.map((item, index) => ({
      id: typeof item.id === "string" ? item.id : `${this.table}-${db[this.table].length + index + 1}`,
      ...item,
    }));
    if (this.table === "payment_refund_requests" && inserted[0]) {
      inserted[0].id = REFUND_ID;
    }
    db[this.table].push(...inserted);
    this.inserted = Array.isArray(row) ? inserted : inserted[0];
    return this;
  }

  update(patch: Row) {
    this.patch = patch;
    return this;
  }

  async maybeSingle() {
    return { data: this.findRows()[0] ?? null, error: null };
  }

  async single() {
    if (this.inserted && !this.patch) {
      return { data: Array.isArray(this.inserted) ? this.inserted[0] : this.inserted, error: null };
    }
    if (!this.patch) {
      const row = this.findRows()[0] ?? null;
      return { data: row, error: row ? null : { message: "not found" } };
    }
    const row = this.applyPatch()[0] ?? null;
    return { data: row, error: row ? null : { message: "not found" } };
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: Row[]; count: number; error: null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    if (this.patch) this.applyPatch();
    const allRows = this.findRows();
    const rows =
      this.rangeEnd == null
        ? allRows
        : allRows.slice(this.rangeStart, this.rangeEnd + 1);
    return Promise.resolve({ data: rows, count: allRows.length, error: null }).then(
      onfulfilled,
      onrejected
    );
  }

  private applyPatch() {
    const rows = db[this.table] ?? [];
    const updated: Row[] = [];
    rows.forEach((row, index) => {
      if (!this.matches(row)) return;
      rows[index] = { ...row, ...this.patch };
      updated.push(rows[index]);
    });
    return updated;
  }

  private findRows() {
    return (db[this.table] ?? []).filter((row) => this.matches(row));
  }

  private matches(row: Row) {
    return this.filters.every(({ field, value, op }) => {
      if (op === "in") return Array.isArray(value) && value.includes(row[field]);
      return row[field] === value;
    });
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
    from: (table: string) => new QueryStub(table),
  }),
}));

function req(path: string, token: keyof typeof tokenUsers | null, method = "GET", body?: Row) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("order refund requests", () => {
  beforeEach(resetDb);

  it("lets users request a full refund for paid orders", async () => {
    const res = await postOrderRefund(
      req(`/api/v1/orders/${ORDER_ID}/refunds`, "user", "POST", {
        reason: "预约时间不合适",
      }),
      ctx(ORDER_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.data.status).toBe("requested");
    expect(body.data.amount).toBe(50000);
    expect(body.data.reason).toBe("预约时间不合适");

    const list = await getOrderRefunds(
      req(`/api/v1/orders/${ORDER_ID}/refunds`, "user"),
      ctx(ORDER_ID)
    );
    const listBody = await list.json();
    expect(list.status).toBe(200);
    expect(listBody.data).toHaveLength(1);
  });

  it("rejects duplicate active refund requests and partial refunds", async () => {
    db.payment_refund_requests = [
      {
        id: REFUND_ID,
        order_id: ORDER_ID,
        user_id: USER_ID,
        amount: 50000,
        currency: "cny",
        status: "requested",
      },
    ];
    const duplicate = await postOrderRefund(
      req(`/api/v1/orders/${ORDER_ID}/refunds`, "user", "POST", {
        reason: "重复申请",
      }),
      ctx(ORDER_ID)
    );
    expect(duplicate.status).toBe(409);

    db.payment_refund_requests = [];
    const partial = await postOrderRefund(
      req(`/api/v1/orders/${ORDER_ID}/refunds`, "user", "POST", {
        amount: 30000,
      }),
      ctx(ORDER_ID)
    );
    expect(partial.status).toBe(400);
  });

  it("lets admins review refunds and mark them succeeded", async () => {
    db.payment_refund_requests = [
      {
        id: REFUND_ID,
        order_id: ORDER_ID,
        user_id: USER_ID,
        amount: 50000,
        currency: "cny",
        status: "requested",
        provider: "stripe",
      },
    ];

    const listed = await getAdminRefunds(req("/api/v1/admin/refunds", "admin"));
    const listedBody = await listed.json();
    expect(listed.status).toBe(200);
    expect(listedBody.data).toHaveLength(1);

    const approved = await reviewAdminRefund(
      req(`/api/v1/admin/refunds/${REFUND_ID}/review`, "admin", "POST", {
        status: "approved",
        review_note: "同意退款",
      }),
      ctx(REFUND_ID)
    );
    const approvedBody = await approved.json();
    expect(approved.status).toBe(200);
    expect(approvedBody.data.status).toBe("approved");

    const succeeded = await reviewAdminRefund(
      req(`/api/v1/admin/refunds/${REFUND_ID}/review`, "admin", "POST", {
        status: "succeeded",
        provider_refund_id: "re_123",
      }),
      ctx(REFUND_ID)
    );
    const succeededBody = await succeeded.json();
    expect(succeeded.status).toBe(200);
    expect(succeededBody.data.status).toBe("succeeded");
    expect(succeededBody.order.status).toBe("refunded");
    expect(db.orders[0].status).toBe("refunded");
    expect(db.mentor_bookings[0].payment_status).toBe("refunded");
    expect(db.mentor_earnings[0].status).toBe("refunded");
    expect(db.notifications.at(-1)?.user_id).toBe(USER_ID);
  });

  it("can initiate provider refunds when marking requests as processing", async () => {
    process.env.PAYMENT_REFUND_ENDPOINT = "https://payments.example.test/refunds";
    process.env.PAYMENT_REFUND_SECRET = "refund-secret";
    db.orders[0].provider_payment_intent_id = "pi_123";
    db.payment_refund_requests = [
      {
        id: REFUND_ID,
        order_id: ORDER_ID,
        user_id: USER_ID,
        amount: 50000,
        currency: "cny",
        status: "approved",
        provider: "stripe",
        reason: "课程取消",
      },
    ];
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          refund_id: "re_123",
          status: "processing",
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await reviewAdminRefund(
      req(`/api/v1/admin/refunds/${REFUND_ID}/review`, "admin", "POST", {
        status: "processing",
      }),
      ctx(REFUND_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(body.data.status).toBe("processing");
    expect(body.data.provider_refund_id).toBe("re_123");
    expect(db.payment_refund_requests[0].metadata).toMatchObject({
      provider_refund_response: { refund_id: "re_123", status: "processing" },
    });
    expect(db.orders[0].status).toBe("paid");
  });
});
