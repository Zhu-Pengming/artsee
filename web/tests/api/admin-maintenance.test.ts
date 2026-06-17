import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as expireSubscriptions } from "@/app/api/v1/admin/maintenance/expire-subscriptions/route";

type Row = Record<string, unknown>;

const db: Record<string, Row[]> = {
  user_profiles: [],
  organizations: [],
};

function resetDb() {
  delete process.env.SUBSCRIPTION_EXPIRATION_CRON_SECRET;
  delete process.env.ADMIN_MAINTENANCE_CRON_SECRET;
  db.user_profiles = [
    {
      id: "member-expired",
      membership_status: "member",
      membership_expires_at: "2020-01-01T00:00:00.000Z",
    },
    {
      id: "member-active",
      membership_status: "member",
      membership_expires_at: "2099-01-01T00:00:00.000Z",
    },
    {
      id: "member-stored-expired",
      membership_status: "expired",
      membership_expires_at: "2020-01-01T00:00:00.000Z",
    },
  ];
  db.organizations = [
    {
      id: "org-expired",
      subscription_status: "active",
      subscription_expires_at: "2020-01-01T00:00:00.000Z",
    },
    {
      id: "org-active",
      subscription_status: "active",
      subscription_expires_at: "2099-01-01T00:00:00.000Z",
    },
    {
      id: "org-stored-expired",
      subscription_status: "expired",
      subscription_expires_at: "2020-01-01T00:00:00.000Z",
    },
  ];
}

vi.mock("@/lib/api/require-admin", () => ({
  requireAdmin: async (req: NextRequest) => {
    const h = req.headers.get("authorization");
    if (h === "Bearer admin-token") {
      return { user: { id: "admin-user" } };
    }
    return {
      response: Response.json(
        { success: false, error: "需要管理员权限" },
        { status: 403 }
      ),
    };
  },
}));

class QueryStub {
  private filters: Array<{
    field: string;
    value: unknown;
    op: "eq" | "lt";
  }> = [];
  private patch: Row | null = null;

  constructor(private readonly table: string) {}

  update(patch: Row) {
    this.patch = patch;
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, value, op: "eq" });
    return this;
  }

  lt(field: string, value: unknown) {
    this.filters.push({ field, value, op: "lt" });
    return this;
  }

  async select() {
    const rows = db[this.table] ?? [];
    const updated: Row[] = [];
    rows.forEach((row, index) => {
      if (!this.matches(row)) return;
      rows[index] = { ...row, ...(this.patch ?? {}) };
      updated.push(rows[index]);
    });
    return { data: updated.map((row) => ({ id: row.id })), error: null };
  }

  private matches(row: Row) {
    return this.filters.every(({ field, value, op }) => {
      if (op === "lt") {
        const left = Date.parse(String(row[field] ?? ""));
        const right = Date.parse(String(value ?? ""));
        return Number.isFinite(left) && Number.isFinite(right) && left < right;
      }
      return row[field] === value;
    });
  }
}

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: (table: string) => new QueryStub(table),
  }),
}));

function req(headers: Record<string, string> = {}) {
  return new NextRequest(
    "http://localhost/api/v1/admin/maintenance/expire-subscriptions",
    {
      method: "POST",
      headers,
    }
  );
}

describe("POST /api/v1/admin/maintenance/expire-subscriptions", () => {
  beforeEach(resetDb);

  it("requires admin access without cron secret", async () => {
    const res = await expireSubscriptions(req());
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("需要管理员权限");
  });

  it("expires stale user memberships and organization subscriptions", async () => {
    const res = await expireSubscriptions(
      req({ authorization: "Bearer admin-token" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.expired_memberships).toBe(1);
    expect(body.data.expired_organizations).toBe(1);
    expect(db.user_profiles.find((row) => row.id === "member-expired")?.membership_status).toBe("expired");
    expect(db.user_profiles.find((row) => row.id === "member-active")?.membership_status).toBe("member");
    expect(db.organizations.find((row) => row.id === "org-expired")?.subscription_status).toBe("expired");
    expect(db.organizations.find((row) => row.id === "org-active")?.subscription_status).toBe("active");
  });

  it("allows server cron calls with the configured secret", async () => {
    process.env.SUBSCRIPTION_EXPIRATION_CRON_SECRET = "secret-123";
    const res = await expireSubscriptions(
      req({ "x-artiqore-cron-secret": "secret-123" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.actor).toBe("cron");
    expect(body.data.expired_memberships).toBe(1);
  });
});
