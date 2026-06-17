import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as listUserReports, POST as postReport } from "@/app/api/v1/reports/route";
import { GET as listAdminReports } from "@/app/api/v1/admin/reports/route";
import { POST as reviewAdminReport } from "@/app/api/v1/admin/reports/[id]/review/route";

type Row = Record<string, unknown>;

const ADMIN_ID = "90000000-0000-4000-8000-000000000001";
const USER_ID = "90000000-0000-4000-8000-000000000002";
const REPORT_ID = "90000000-0000-4000-8000-000000000010";
const TARGET_ID = "90000000-0000-4000-8000-000000000020";

const tokenUsers: Record<string, string> = {
  admin: ADMIN_ID,
  user: USER_ID,
};

const db: Record<string, Row[]> = {
  user_profiles: [],
  artworks: [],
  content_reports: [],
  notifications: [],
  admin_audit_logs: [],
};

function resetDb() {
  db.user_profiles = [
    { id: ADMIN_ID, role: "admin" },
    { id: USER_ID, role: "user" },
  ];
  db.artworks = [
    {
      id: TARGET_ID,
      user_id: USER_ID,
      title: "被举报作品",
      status: "published",
    },
  ];
  db.content_reports = [];
  db.notifications = [];
  db.admin_audit_logs = [];
}

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
        typeof item.id === "string"
          ? item.id
          : this.table === "content_reports"
            ? REPORT_ID
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

describe("content reports", () => {
  beforeEach(resetDb);

  it("lets users submit and list their reports", async () => {
    const denied = await postReport(
      req("/api/v1/reports", null, "POST", {
        target_type: "artwork",
        target_id: TARGET_ID,
        reason: "false_info",
      })
    );
    expect(denied.status).toBe(401);

    const created = await postReport(
      req("/api/v1/reports", "user", "POST", {
        target_type: "artwork",
        target_id: TARGET_ID,
        reason: "false_info",
        detail: "作品录取信息疑似不实",
      })
    );
    const body = await created.json();
    expect(created.status).toBe(201);
    expect(body.data.status).toBe("pending");
    expect(body.data.target_type).toBe("artwork");
    expect(body.data.priority).toBe("normal");
    expect(body.data.risk_score).toBe(45);
    expect(body.data.target_report_count).toBe(1);
    expect(db.content_reports[0].reporter_user_id).toBe(USER_ID);
    expect(db.notifications.at(-1)?.user_id).toBe(USER_ID);

    const listed = await listUserReports(req("/api/v1/reports", "user"));
    const listedBody = await listed.json();
    expect(listed.status).toBe(200);
    expect(listedBody.data).toHaveLength(1);
  });

  it("rejects duplicate active reports", async () => {
    db.content_reports = [
      {
        id: REPORT_ID,
        reporter_user_id: USER_ID,
        target_type: "artwork",
        target_id: TARGET_ID,
        reason: "false_info",
        status: "pending",
      },
    ];

    const duplicate = await postReport(
      req("/api/v1/reports", "user", "POST", {
        target_type: "artwork",
        target_id: TARGET_ID,
        reason: "false_info",
      })
    );
    expect(duplicate.status).toBe(409);
  });

  it("lets admins list and review reports", async () => {
    db.content_reports = [
      {
        id: REPORT_ID,
        reporter_user_id: USER_ID,
        target_type: "artwork",
        target_id: TARGET_ID,
        reason: "false_info",
        detail: "作品录取信息疑似不实",
        status: "pending",
        priority: "high",
        risk_score: 65,
        target_report_count: 2,
        metadata: {},
      },
    ];

    const denied = await listAdminReports(req("/api/v1/admin/reports", "user"));
    expect(denied.status).toBe(403);

    const listed = await listAdminReports(
      req("/api/v1/admin/reports?status=pending&priority=high", "admin")
    );
    const listedBody = await listed.json();
    expect(listed.status).toBe(200);
    expect(listedBody.data).toHaveLength(1);

    const reviewed = await reviewAdminReport(
      req(`/api/v1/admin/reports/${REPORT_ID}/review`, "admin", "POST", {
        status: "resolved",
        resolution_note: "已核查并处理",
        moderation_action: "hide_target",
      }),
      ctx(REPORT_ID)
    );
    const reviewedBody = await reviewed.json();
    expect(reviewed.status).toBe(200);
    expect(reviewedBody.data.status).toBe("resolved");
    expect(reviewedBody.data.reviewed_by_user_id).toBe(ADMIN_ID);
    expect(reviewedBody.data.metadata.review.moderation_action).toBe("hide_target");
    expect(reviewedBody.moderation.status).toBe("archived");
    expect(db.artworks[0].status).toBe("archived");
    expect(db.notifications.at(-1)?.user_id).toBe(USER_ID);
    expect(db.admin_audit_logs.at(-1)?.action).toBe("content_report.review");
    expect((db.admin_audit_logs.at(-1)?.metadata as Row).moderation_action).toBe("hide_target");
  });
});
