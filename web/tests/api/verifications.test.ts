import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as submitVerification } from "@/app/api/v1/verifications/route";
import { GET as getMyVerifications } from "@/app/api/v1/verifications/me/route";
import { GET as getAdminVerifications } from "@/app/api/v1/admin/verifications/route";
import { POST as reviewVerification } from "@/app/api/v1/admin/verifications/[id]/review/route";

type Row = Record<string, unknown>;

const userIds: Record<string, string> = {
  admin: "admin-user",
  student: "student-user",
};

const db: Record<string, Row[]> = {
  user_profiles: [],
  user_roles: [],
  verifications: [],
  organizations: [],
  organization_members: [],
  notifications: [],
  admin_audit_logs: [],
};

function resetDb() {
  db.user_profiles = [
    {
      id: userIds.admin,
      role: "admin",
      user_type: null,
      user_role: null,
      is_verified: false,
    },
    {
      id: userIds.student,
      role: "user",
      user_type: "personal",
      user_role: "student",
      is_verified: false,
    },
  ];
  db.user_roles = [];
  db.verifications = [];
  db.organizations = [];
  db.organization_members = [];
  db.notifications = [];
  db.admin_audit_logs = [];
}

class QueryStub {
  private filters: Array<{ field: string; value: unknown }> = [];
  private patch: Row | null = null;
  private inserted: Row | null = null;
  private rangeStart = 0;
  private rangeEnd: number | null = null;

  constructor(private readonly table: string) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, value });
    return this;
  }

  in(field: string, values: unknown[]) {
    this.filters.push({ field, value: values });
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

  insert(row: Row) {
    this.inserted = {
      id: typeof row.id === "string" ? row.id : `${this.table}-${db[this.table].length + 1}`,
      created_at: "2026-06-14T12:00:00.000Z",
      updated_at: "2026-06-14T12:00:00.000Z",
      ...row,
    };
    db[this.table].push(this.inserted);
    return this;
  }

  update(patch: Row) {
    this.patch = patch;
    return this;
  }

  async upsert(row: Row) {
    const rows = db[this.table];
    const index = rows.findIndex((item) => {
      if (this.table === "user_roles") {
        return item.user_id === row.user_id && item.role_code === row.role_code;
      }
      if (this.table === "organization_members") {
        return (
          item.organization_id === row.organization_id &&
          item.user_id === row.user_id
        );
      }
      return item.id === row.id;
    });
    if (index >= 0) {
      rows[index] = { ...rows[index], ...row };
    } else {
      rows.push({ ...row });
    }
    return { data: row, error: null };
  }

  async maybeSingle() {
    return { data: this.findRows()[0] ?? null, error: null };
  }

  async single() {
    if (this.inserted) return { data: this.inserted, error: null };
    if (this.patch) {
      const rows = db[this.table];
      const index = rows.findIndex((row) => this.matches(row));
      if (index < 0) return { data: null, error: { message: "not found" } };
      rows[index] = { ...rows[index], ...this.patch };
      return { data: rows[index], error: null };
    }
    const row = this.findRows()[0] ?? null;
    return { data: row, error: row ? null : { message: "not found" } };
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: Row[]; count: number; error: null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    if (this.patch) {
      const rows = db[this.table];
      for (let index = 0; index < rows.length; index += 1) {
        if (this.matches(rows[index])) {
          rows[index] = { ...rows[index], ...this.patch };
        }
      }
    }
    const found = this.findRows();
    const rows =
      this.rangeEnd == null
        ? found
        : found.slice(this.rangeStart, this.rangeEnd + 1);
    return Promise.resolve({ data: rows, count: found.length, error: null }).then(
      onfulfilled,
      onrejected
    );
  }

  private findRows() {
    return (db[this.table] ?? []).filter((row) => this.matches(row));
  }

  private matches(row: Row) {
    return this.filters.every(({ field, value }) => {
      if (Array.isArray(value)) return value.includes(row[field]);
      return row[field] === value;
    });
  }
}

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: async (req: NextRequest) => {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/, "");
    const id = token ? userIds[token] : null;
    return id ? ({ id } as { id: string }) : null;
  },
}));

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: (table: string) => new QueryStub(table),
  }),
}));

function req(path: string, token: keyof typeof userIds | null, method = "GET", body?: Row) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("verifications", () => {
  beforeEach(resetDb);

  it("creates and lists the current user's verification requests", async () => {
    const created = await submitVerification(
      req("/api/v1/verifications", "student", "POST", {
        type: "business",
        materials: {
          requested_role: "gallery_exhibition",
          company_name: "艺见画廊",
        },
      })
    );
    const createdBody = await created.json();
    expect(created.status).toBe(201);
    expect(createdBody.data.status).toBe("pending");
    expect(createdBody.data.materials.requested_role).toBe("gallery_exhibition");

    const mine = await getMyVerifications(
      req("/api/v1/verifications/me", "student")
    );
    const mineBody = await mine.json();
    expect(mine.status).toBe(200);
    expect(mineBody.data).toHaveLength(1);
  });

  it("lets admins list verification requests with user profile context", async () => {
    db.verifications = [
      {
        id: "verification-1",
        user_id: userIds.student,
        type: "business",
        materials: { requested_role: "gallery_exhibition" },
        status: "pending",
        created_at: "2026-06-14T12:00:00.000Z",
      },
      {
        id: "verification-2",
        user_id: userIds.student,
        type: "artist",
        materials: {},
        status: "approved",
        created_at: "2026-06-14T11:00:00.000Z",
      },
    ];

    const denied = await getAdminVerifications(
      req("/api/v1/admin/verifications", "student")
    );
    expect(denied.status).toBe(403);

    const listed = await getAdminVerifications(
      req("/api/v1/admin/verifications?status=pending&type=business", "admin")
    );
    const body = await listed.json();
    expect(listed.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("verification-1");
    expect(body.data[0].user.nickname).toBeUndefined();
    expect(body.data[0].user.user_role).toBe("student");
  });

  it("syncs profile role and user_roles when admin approves business verification", async () => {
    db.verifications.push({
      id: "verification-1",
      user_id: userIds.student,
      type: "business",
      materials: {
        requested_role: "gallery_exhibition",
        company_name: "艺见画廊",
      },
      status: "pending",
    });

    const denied = await reviewVerification(
      req("/api/v1/admin/verifications/verification-1/review", "student", "POST", {
        status: "approved",
      }),
      ctx("verification-1")
    );
    expect(denied.status).toBe(403);

    const approved = await reviewVerification(
      req("/api/v1/admin/verifications/verification-1/review", "admin", "POST", {
        status: "approved",
      }),
      ctx("verification-1")
    );
    const approvedBody = await approved.json();
    expect(approved.status).toBe(200);
    expect(approvedBody.data.status).toBe("approved");

    const profile = db.user_profiles.find((row) => row.id === userIds.student);
    expect(profile?.user_type).toBe("business");
    expect(profile?.user_role).toBe("gallery_exhibition");
    expect(profile?.is_verified).toBe(true);
    expect(db.user_roles).toContainEqual({
      user_id: userIds.student,
      role_code: "business_verified",
    });
    expect(db.organizations).toHaveLength(1);
    expect(db.organizations[0]).toMatchObject({
      owner_user_id: userIds.student,
      name: "艺见画廊",
      type: "gallery_exhibition",
      status: "active",
      verification_status: "verified",
    });
    expect(db.organization_members).toContainEqual({
      organization_id: "organizations-1",
      user_id: userIds.student,
      role: "owner",
      status: "active",
    });
    expect(db.notifications[0]).toMatchObject({
      user_id: userIds.student,
      title: "机构入驻认证已通过",
      type: "verification",
      read_status: "unread",
      metadata: {
        verification_id: "verification-1",
        verification_type: "business",
        status: "approved",
      },
    });
    expect(db.admin_audit_logs[0]).toMatchObject({
      actor_user_id: userIds.admin,
      action: "verification.review",
      target_type: "verification",
      target_id: "verification-1",
      target_label: "机构入驻",
      metadata: {
        status: "approved",
        user_id: userIds.student,
        verification_type: "business",
        has_review_note: false,
      },
    });

    await reviewVerification(
      req("/api/v1/admin/verifications/verification-1/review", "admin", "POST", {
        status: "approved",
      }),
      ctx("verification-1")
    );
    expect(db.organizations).toHaveLength(1);
    expect(db.organization_members).toHaveLength(1);
  });
});
