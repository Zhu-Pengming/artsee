import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  GET as getPayoutBatches,
  POST as postPayoutBatch,
} from "@/app/api/v1/admin/payout-batches/route";
import { POST as processPayoutBatch } from "@/app/api/v1/admin/payout-batches/[id]/process/route";

type Row = Record<string, unknown>;

const ADMIN_ID = "60000000-0000-4000-8000-000000000001";
const USER_ID = "60000000-0000-4000-8000-000000000002";
const MENTOR_ID = "60000000-0000-4000-8000-000000000003";
const WITHDRAWAL_ID = "60000000-0000-4000-8000-000000000010";
const OTHER_WITHDRAWAL_ID = "60000000-0000-4000-8000-000000000011";
const BATCH_ID = "60000000-0000-4000-8000-000000000020";

const tokenUsers: Record<string, string> = {
  admin: ADMIN_ID,
  user: USER_ID,
};

const db: Record<string, Row[]> = {
  user_profiles: [],
  mentors: [],
  mentor_withdrawal_requests: [],
  payout_batches: [],
  payout_batch_items: [],
  financial_ledger_entries: [],
  notifications: [],
};

function resetDb() {
  delete process.env.PAYMENT_PAYOUT_ENDPOINT;
  delete process.env.PAYMENT_PAYOUT_SECRET;
  delete process.env.PAYMENT_PAYOUT_PROVIDER;
  db.user_profiles = [
    { id: ADMIN_ID, role: "admin" },
    { id: USER_ID, role: "user" },
  ];
  db.mentors = [{ id: MENTOR_ID, user_id: USER_ID }];
  db.mentor_withdrawal_requests = [
    {
      id: WITHDRAWAL_ID,
      mentor_id: MENTOR_ID,
      requested_by_user_id: USER_ID,
      amount: 30000,
      currency: "cny",
      status: "approved",
    },
    {
      id: OTHER_WITHDRAWAL_ID,
      mentor_id: MENTOR_ID,
      requested_by_user_id: USER_ID,
      amount: 20000,
      currency: "cny",
      status: "requested",
    },
  ];
  db.payout_batches = [];
  db.payout_batch_items = [];
  db.financial_ledger_entries = [];
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

  insert(row: Row | Row[]) {
    const rows = Array.isArray(row) ? row : [row];
    const inserted = rows.map((item, index) => ({
      id:
        this.table === "payout_batches"
          ? BATCH_ID
          : `${this.table}-${db[this.table].length + index + 1}`,
      ...item,
    }));
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
    const allRows = this.inserted
      ? Array.isArray(this.inserted)
        ? this.inserted
        : [this.inserted]
      : this.findRows();
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

describe("admin payout batches", () => {
  beforeEach(resetDb);

  it("creates payout batches from approved withdrawal requests", async () => {
    const denied = await postPayoutBatch(
      req("/api/v1/admin/payout-batches", "user", "POST", {
        withdrawal_ids: [WITHDRAWAL_ID],
      })
    );
    expect(denied.status).toBe(403);

    const res = await postPayoutBatch(
      req("/api/v1/admin/payout-batches", "admin", "POST", {
        withdrawal_ids: [WITHDRAWAL_ID],
        notes: "六月第一批",
      })
    );
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.data.status).toBe("draft");
    expect(body.data.total_amount).toBe(30000);
    expect(body.items).toHaveLength(1);
    expect(db.payout_batch_items[0].withdrawal_request_id).toBe(WITHDRAWAL_ID);

    const listed = await getPayoutBatches(req("/api/v1/admin/payout-batches", "admin"));
    const listedBody = await listed.json();
    expect(listed.status).toBe(200);
    expect(listedBody.data).toHaveLength(1);
  });

  it("rejects withdrawal requests that are not approved", async () => {
    const res = await postPayoutBatch(
      req("/api/v1/admin/payout-batches", "admin", "POST", {
        withdrawal_ids: [OTHER_WITHDRAWAL_ID],
      })
    );
    expect(res.status).toBe(400);
  });

  it("marks payout batches paid and updates withdrawals", async () => {
    db.payout_batches = [
      {
        id: BATCH_ID,
        batch_no: "PB202606130001",
        status: "draft",
        total_amount: 30000,
        item_count: 1,
        currency: "cny",
      },
    ];
    db.payout_batch_items = [
      {
        id: "item-1",
        batch_id: BATCH_ID,
        withdrawal_request_id: WITHDRAWAL_ID,
        mentor_id: MENTOR_ID,
        amount: 30000,
        currency: "cny",
        status: "pending",
      },
    ];

    const res = await processPayoutBatch(
      req(`/api/v1/admin/payout-batches/${BATCH_ID}/process`, "admin", "POST", {
        status: "paid",
        provider_batch_id: "batch_123",
        notes: "银行批量打款完成",
      }),
      ctx(BATCH_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.status).toBe("paid");
    expect(db.payout_batch_items[0].status).toBe("paid");
    expect(db.mentor_withdrawal_requests[0].status).toBe("paid");
    expect(db.mentor_withdrawal_requests[0].paid_by_user_id).toBe(ADMIN_ID);
    expect(db.financial_ledger_entries.at(-1)?.entry_type).toBe("payout_paid");
    expect(db.financial_ledger_entries.at(-1)?.amount).toBe(30000);
    expect(db.notifications.at(-1)?.user_id).toBe(USER_ID);
  });

  it("initiates provider payout batches and keeps withdrawals approved while processing", async () => {
    process.env.PAYMENT_PAYOUT_PROVIDER = "bank";
    process.env.PAYMENT_PAYOUT_ENDPOINT = "https://payments.example.test/payouts";
    process.env.PAYMENT_PAYOUT_SECRET = "payout-secret";
    db.payout_batches = [
      {
        id: BATCH_ID,
        batch_no: "PB202606130001",
        status: "draft",
        total_amount: 30000,
        item_count: 1,
        currency: "cny",
        metadata: {},
      },
    ];
    db.payout_batch_items = [
      {
        id: "item-1",
        batch_id: BATCH_ID,
        withdrawal_request_id: WITHDRAWAL_ID,
        mentor_id: MENTOR_ID,
        amount: 30000,
        currency: "cny",
        status: "pending",
      },
    ];
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          provider_batch_id: "pb_provider_123",
          status: "processing",
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await processPayoutBatch(
      req(`/api/v1/admin/payout-batches/${BATCH_ID}/process`, "admin", "POST", {
        status: "processing",
      }),
      ctx(BATCH_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(body.data.status).toBe("processing");
    expect(body.data.provider).toBe("bank");
    expect(body.data.provider_batch_id).toBe("pb_provider_123");
    expect(db.payout_batch_items[0].status).toBe("processing");
    expect(db.mentor_withdrawal_requests[0].status).toBe("approved");
  });

  it("marks withdrawals paid when provider payout completes immediately", async () => {
    process.env.PAYMENT_PAYOUT_PROVIDER = "bank";
    process.env.PAYMENT_PAYOUT_ENDPOINT = "https://payments.example.test/payouts";
    db.payout_batches = [
      {
        id: BATCH_ID,
        batch_no: "PB202606130001",
        status: "draft",
        total_amount: 30000,
        item_count: 1,
        currency: "cny",
        metadata: {},
      },
    ];
    db.payout_batch_items = [
      {
        id: "item-1",
        batch_id: BATCH_ID,
        withdrawal_request_id: WITHDRAWAL_ID,
        mentor_id: MENTOR_ID,
        amount: 30000,
        currency: "cny",
        status: "pending",
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            batch_id: "pb_provider_done",
            status: "paid",
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      })
    );

    const res = await processPayoutBatch(
      req(`/api/v1/admin/payout-batches/${BATCH_ID}/process`, "admin", "POST", {
        status: "processing",
      }),
      ctx(BATCH_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.status).toBe("paid");
    expect(db.payout_batch_items[0].status).toBe("paid");
    expect(db.mentor_withdrawal_requests[0].status).toBe("paid");
    expect(db.financial_ledger_entries.at(-1)?.entry_type).toBe("payout_paid");
    expect(db.notifications.at(-1)?.user_id).toBe(USER_ID);
  });
});
