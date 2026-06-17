import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as getAdminUsers } from "@/app/api/v1/admin/users/route";
import { PATCH as patchAdminUser } from "@/app/api/v1/admin/users/[id]/route";

type Row = Record<string, unknown>;

const ADMIN_ID = "admin-user";
const STUDENT_ID = "student-user";
const OTHER_ID = "other-user";

const tokenUsers: Record<string, string> = {
  admin: ADMIN_ID,
  student: STUDENT_ID,
  other: OTHER_ID,
};

const db: Record<string, Row[]> = {
  user_profiles: [],
  notifications: [],
  admin_audit_logs: [],
};

function resetDb() {
  db.user_profiles = [
    {
      id: ADMIN_ID,
      nickname: "管理员",
      role: "admin",
      status: "active",
      user_type: null,
      user_role: null,
      created_at: "2026-06-12T09:00:00.000Z",
    },
    {
      id: STUDENT_ID,
      nickname: "学生",
      role: "user",
      status: "active",
      user_type: "personal",
      user_role: "student",
      created_at: "2026-06-12T10:00:00.000Z",
    },
    {
      id: OTHER_ID,
      nickname: "普通用户",
      role: "user",
      status: "banned",
      user_type: "personal",
      user_role: "student",
      created_at: "2026-06-12T11:00:00.000Z",
    },
  ];
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

  ilike() {
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
      ...row,
    };
    db[this.table].push(this.inserted);
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
    const rows = this.findRows();
    const sliced =
      this.rangeEnd == null
        ? rows
        : rows.slice(this.rangeStart, this.rangeEnd + 1);
    return Promise.resolve({ data: sliced, count: rows.length, error: null }).then(
      onfulfilled,
      onrejected
    );
  }

  private findRows() {
    return (db[this.table] ?? []).filter((row) => this.matches(row));
  }

  private matches(row: Row) {
    return this.filters.every(({ field, value }) => row[field] === value);
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

describe("admin user management", () => {
  beforeEach(resetDb);

  it("lists users for admins and blocks regular users", async () => {
    const denied = await getAdminUsers(req("/api/v1/admin/users", "student"));
    expect(denied.status).toBe(403);

    const listed = await getAdminUsers(req("/api/v1/admin/users?status=active", "admin"));
    const body = await listed.json();
    expect(listed.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.count).toBe(2);
  });

  it("updates roles and user moderation status", async () => {
    const promoted = await patchAdminUser(
      req(`/api/v1/admin/users/${STUDENT_ID}`, "admin", "PATCH", {
        role: "creator",
        admin_note: "内容贡献高",
      }),
      ctx(STUDENT_ID)
    );
    const promotedBody = await promoted.json();
    expect(promoted.status).toBe(200);
    expect(promotedBody.data.role).toBe("creator");
    expect(promotedBody.data.admin_note).toBe("内容贡献高");
    expect(db.notifications.at(-1)?.user_id).toBe(STUDENT_ID);
    expect(db.admin_audit_logs.at(-1)?.action).toBe("user.update");
    expect(db.admin_audit_logs.at(-1)?.target_id).toBe(STUDENT_ID);

    const banned = await patchAdminUser(
      req(`/api/v1/admin/users/${STUDENT_ID}`, "admin", "PATCH", {
        status: "banned",
        banned_reason: "刷评",
      }),
      ctx(STUDENT_ID)
    );
    const bannedBody = await banned.json();
    expect(banned.status).toBe(200);
    expect(bannedBody.data.status).toBe("banned");
    expect(bannedBody.data.banned_by_user_id).toBe(ADMIN_ID);
    expect(bannedBody.data.banned_reason).toBe("刷评");

    const restored = await patchAdminUser(
      req(`/api/v1/admin/users/${STUDENT_ID}`, "admin", "PATCH", {
        status: "active",
      }),
      ctx(STUDENT_ID)
    );
    const restoredBody = await restored.json();
    expect(restored.status).toBe(200);
    expect(restoredBody.data.status).toBe("active");
    expect(restoredBody.data.banned_reason).toBeNull();
  });

  it("protects admins from demoting or banning themselves", async () => {
    const demote = await patchAdminUser(
      req(`/api/v1/admin/users/${ADMIN_ID}`, "admin", "PATCH", {
        role: "user",
      }),
      ctx(ADMIN_ID)
    );
    expect(demote.status).toBe(400);

    const banSelf = await patchAdminUser(
      req(`/api/v1/admin/users/${ADMIN_ID}`, "admin", "PATCH", {
        status: "banned",
      }),
      ctx(ADMIN_ID)
    );
    expect(banSelf.status).toBe(400);
  });
});
