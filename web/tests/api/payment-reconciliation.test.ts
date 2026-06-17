import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as importReconciliation } from "@/app/api/v1/admin/reconciliation/import/route";
import { GET as getReconciliationItems } from "@/app/api/v1/admin/reconciliation/items/route";
import { POST as resolveReconciliationItem } from "@/app/api/v1/admin/reconciliation/items/[id]/resolve/route";
import { GET as getReconciliationRuns } from "@/app/api/v1/admin/reconciliation/runs/route";

type Row = Record<string, unknown>;

const ADMIN_ID = "70000000-0000-4000-8000-000000000001";
const USER_ID = "70000000-0000-4000-8000-000000000002";
const ORDER_ID = "70000000-0000-4000-8000-000000000010";
const RUN_ID = "70000000-0000-4000-8000-000000000020";
const MENTOR_ID = "70000000-0000-4000-8000-000000000030";
const WITHDRAWAL_ID = "70000000-0000-4000-8000-000000000040";
const BATCH_ID = "70000000-0000-4000-8000-000000000050";
const RECON_ITEM_ID = "70000000-0000-4000-8000-000000000070";

const tokenUsers: Record<string, string> = {
  admin: ADMIN_ID,
  user: USER_ID,
};

const db: Record<string, Row[]> = {
  user_profiles: [],
  orders: [],
  payment_refund_requests: [],
  payout_batches: [],
  payout_batch_items: [],
  mentor_withdrawal_requests: [],
  mentors: [],
  mentor_bookings: [],
  mentor_earnings: [],
  payment_reconciliation_runs: [],
  payment_reconciliation_items: [],
  admin_audit_logs: [],
  notifications: [],
};

function resetDb() {
  db.user_profiles = [
    { id: ADMIN_ID, role: "admin" },
    { id: USER_ID, role: "user" },
  ];
  db.orders = [
    {
      id: ORDER_ID,
      user_id: USER_ID,
      order_no: "AQ202606130003",
      subject: "测试订单",
      item_type: "manual_service",
      amount_total: 50000,
      currency: "cny",
      status: "checkout_created",
      provider: "stripe",
      provider_payment_intent_id: "pi_recon_123",
      metadata: {},
    },
  ];
  db.payment_refund_requests = [];
  db.payout_batches = [
    {
      id: BATCH_ID,
      batch_no: "PB202606130002",
      provider_batch_id: "pb_recon_123",
      status: "processing",
      total_amount: 30000,
      currency: "cny",
      metadata: {},
    },
  ];
  db.payout_batch_items = [
    {
      id: "70000000-0000-4000-8000-000000000060",
      batch_id: BATCH_ID,
      withdrawal_request_id: WITHDRAWAL_ID,
      mentor_id: MENTOR_ID,
      amount: 30000,
      currency: "cny",
      status: "processing",
    },
  ];
  db.mentor_withdrawal_requests = [
    {
      id: WITHDRAWAL_ID,
      mentor_id: MENTOR_ID,
      requested_by_user_id: USER_ID,
      amount: 30000,
      currency: "cny",
      status: "approved",
      metadata: {},
    },
  ];
  db.mentors = [{ id: MENTOR_ID, user_id: USER_ID }];
  db.mentor_bookings = [];
  db.mentor_earnings = [];
  db.payment_reconciliation_runs = [];
  db.payment_reconciliation_items = [];
  db.admin_audit_logs = [];
  db.notifications = [];
}

class QueryStub {
  private filters: Array<{ field: string; value: unknown; op: "eq" | "in" }> = [];
  private patch: Row | null = null;
  private inserted: Row | Row[] | null = null;

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

  range() {
    return this;
  }

  limit() {
    return this;
  }

  insert(row: Row | Row[]) {
    const rows = Array.isArray(row) ? row : [row];
    const inserted = rows.map((item, index) => ({
      id:
        typeof item.id === "string"
          ? item.id
          : this.table === "payment_reconciliation_runs"
            ? RUN_ID
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
    const rows = this.inserted
      ? Array.isArray(this.inserted)
        ? this.inserted
        : [this.inserted]
      : this.findRows();
    return Promise.resolve({ data: rows, count: rows.length, error: null }).then(
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

function req(token: keyof typeof tokenUsers | null, body: Row) {
  return new NextRequest("http://localhost/api/v1/admin/reconciliation/import", {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(body),
  });
}

function getReq(token: keyof typeof tokenUsers | null, query = "") {
  return new NextRequest(`http://localhost/api/v1/admin/reconciliation/runs${query}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

function getItemsReq(token: keyof typeof tokenUsers | null, query = "") {
  return new NextRequest(`http://localhost/api/v1/admin/reconciliation/items${query}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

function resolveReq(token: keyof typeof tokenUsers | null, body: Row) {
  return new NextRequest("http://localhost/api/v1/admin/reconciliation/items/item/resolve", {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(body),
  });
}

function resolveCtx(id = RECON_ITEM_ID) {
  return { params: Promise.resolve({ id }) };
}

describe("admin payment reconciliation import", () => {
  beforeEach(resetDb);

  it("requires admin permission", async () => {
    const res = await importReconciliation(
      req("user", {
        provider: "stripe",
        kind: "orders",
        rows: [{ provider_payment_intent_id: "pi_recon_123", amount: 50000 }],
      })
    );
    expect(res.status).toBe(403);
  });

  it("auto-applies matched paid order rows", async () => {
    const res = await importReconciliation(
      req("admin", {
        provider: "stripe",
        kind: "orders",
        source_name: "stripe-settlement-2026-06-13.csv",
        rows: [
          {
            provider_payment_intent_id: "pi_recon_123",
            amount: 50000,
            currency: "cny",
            status: "paid",
          },
        ],
      })
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.matched_count).toBe(1);
    expect(body.items[0].status).toBe("auto_applied");
    expect(db.orders[0].status).toBe("paid");
    expect(db.orders[0].paid_at).toBeTruthy();
    expect(db.payment_reconciliation_items[0].matched_entity_id).toBe(ORDER_ID);
    expect(db.admin_audit_logs.at(-1)?.action).toBe("reconciliation.import");
  });

  it("keeps amount mismatches for manual review", async () => {
    const res = await importReconciliation(
      req("admin", {
        provider: "stripe",
        kind: "orders",
        rows: [
          {
            provider_payment_intent_id: "pi_recon_123",
            amount: 49999,
            currency: "cny",
            status: "paid",
          },
        ],
      })
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.mismatch_count).toBe(1);
    expect(body.items[0].status).toBe("mismatch");
    expect(body.items[0].error_message).toBe("amount mismatch");
    expect(db.orders[0].status).toBe("checkout_created");
  });

  it("auto-applies paid payout batch rows", async () => {
    const res = await importReconciliation(
      req("admin", {
        provider: "bank",
        kind: "payouts",
        rows: [
          {
            provider_batch_id: "pb_recon_123",
            amount: 30000,
            currency: "cny",
            status: "paid",
          },
        ],
      })
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.items[0].status).toBe("auto_applied");
    expect(db.payout_batches[0].status).toBe("paid");
    expect(db.payout_batch_items[0].status).toBe("paid");
    expect(db.mentor_withdrawal_requests[0].status).toBe("paid");
    expect(db.mentor_withdrawal_requests[0].paid_by_user_id).toBe(ADMIN_ID);
    expect(db.notifications.at(-1)?.user_id).toBe(USER_ID);
  });

  it("lists reconciliation runs with optional items", async () => {
    db.payment_reconciliation_runs = [
      {
        id: RUN_ID,
        provider: "stripe",
        kind: "orders",
        row_count: 2,
        matched_count: 1,
        unmatched_count: 1,
        mismatch_count: 0,
        created_by_user_id: ADMIN_ID,
      },
    ];
    db.payment_reconciliation_items = [
      {
        id: "payment_reconciliation_items-1",
        run_id: RUN_ID,
        provider: "stripe",
        kind: "orders",
        external_id: "pi_recon_123",
        status: "auto_applied",
      },
    ];

    const denied = await getReconciliationRuns(getReq("user"));
    expect(denied.status).toBe(403);

    const res = await getReconciliationRuns(getReq("admin", "?include_items=true"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].items).toHaveLength(1);
    expect(body.data[0].items[0].external_id).toBe("pi_recon_123");
  });

  it("lists open reconciliation discrepancies", async () => {
    db.payment_reconciliation_items = [
      {
        id: RECON_ITEM_ID,
        run_id: RUN_ID,
        provider: "stripe",
        kind: "orders",
        external_id: "pi_recon_mismatch",
        status: "mismatch",
        resolution_status: "open",
        amount: 49999,
        expected_amount: 50000,
      },
      {
        id: "70000000-0000-4000-8000-000000000071",
        run_id: RUN_ID,
        provider: "stripe",
        kind: "orders",
        external_id: "pi_recon_ok",
        status: "auto_applied",
        resolution_status: "open",
      },
    ];

    const denied = await getReconciliationItems(getItemsReq("user"));
    expect(denied.status).toBe(403);

    const res = await getReconciliationItems(
      getItemsReq("admin", "?resolution_status=open&status=all")
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe(RECON_ITEM_ID);
  });

  it("resolves reconciliation discrepancies with audit logs", async () => {
    db.payment_reconciliation_items = [
      {
        id: RECON_ITEM_ID,
        run_id: RUN_ID,
        provider: "stripe",
        kind: "orders",
        external_id: "pi_recon_mismatch",
        matched_entity_type: "order",
        matched_entity_id: ORDER_ID,
        status: "mismatch",
        resolution_status: "open",
        amount: 49999,
        expected_amount: 50000,
      },
    ];

    const denied = await resolveReconciliationItem(
      resolveReq("user", { resolution_status: "resolved" }),
      resolveCtx()
    );
    expect(denied.status).toBe(403);

    const res = await resolveReconciliationItem(
      resolveReq("admin", {
        resolution_status: "resolved",
        resolution_note: "已核对 provider 手续费差异，手工入账。",
      }),
      resolveCtx()
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.resolution_status).toBe("resolved");
    expect(body.data.resolution_note).toBe("已核对 provider 手续费差异，手工入账。");
    expect(body.data.resolved_by_user_id).toBe(ADMIN_ID);
    expect(body.data.resolved_at).toBeTruthy();
    expect(db.admin_audit_logs.at(-1)?.action).toBe("reconciliation_item.resolve");
    expect(db.admin_audit_logs.at(-1)?.target_id).toBe(RECON_ITEM_ID);
  });
});
