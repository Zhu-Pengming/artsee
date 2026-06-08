import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET as getSchools, POST as postSchools } from "@/app/api/v1/schools/route";
import { GET as getSchoolById, PATCH as patchSchoolById } from "@/app/api/v1/schools/[id]/route";
import { GET as getPrograms, POST as postPrograms } from "@/app/api/v1/programs/route";
import { GET as getProgramById, DELETE as deleteProgramById } from "@/app/api/v1/programs/[id]/route";

type QueryResult = { data: unknown; error: { message: string } | null; count?: number | null };

class QueryStub {
  public operations: Array<{ method: string; args: unknown[] }> = [];
  public result: QueryResult = { data: [], error: null, count: 0 };
  public singleResult: QueryResult = { data: { id: 1 }, error: null };
  public maybeSingleResult: QueryResult = { data: { id: 1 }, error: null };

  select(...args: unknown[]) {
    this.operations.push({ method: "select", args });
    return this;
  }

  eq(...args: unknown[]) {
    this.operations.push({ method: "eq", args });
    return this;
  }

  or(...args: unknown[]) {
    this.operations.push({ method: "or", args });
    return this;
  }

  ilike(...args: unknown[]) {
    this.operations.push({ method: "ilike", args });
    return this;
  }

  in(...args: unknown[]) {
    this.operations.push({ method: "in", args });
    return this;
  }

  gte(...args: unknown[]) {
    this.operations.push({ method: "gte", args });
    return this;
  }

  lte(...args: unknown[]) {
    this.operations.push({ method: "lte", args });
    return this;
  }

  order(...args: unknown[]) {
    this.operations.push({ method: "order", args });
    return this;
  }

  range(...args: unknown[]) {
    this.operations.push({ method: "range", args });
    return this;
  }

  insert(...args: unknown[]) {
    this.operations.push({ method: "insert", args });
    return this;
  }

  update(...args: unknown[]) {
    this.operations.push({ method: "update", args });
    return this;
  }

  delete(...args: unknown[]) {
    this.operations.push({ method: "delete", args });
    return this;
  }

  single() {
    this.operations.push({ method: "single", args: [] });
    return Promise.resolve(this.singleResult);
  }

  maybeSingle() {
    this.operations.push({ method: "maybeSingle", args: [] });
    return Promise.resolve(this.maybeSingleResult);
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

const mocked = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  createServiceClient: vi.fn(),
}));

vi.mock("@/lib/api/require-admin", () => ({
  requireAdmin: (...args: unknown[]) => mocked.requireAdmin(...args),
}));

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => mocked.createServiceClient(),
}));

function buildClient(tableMap: Record<string, QueryStub>) {
  return {
    from: (table: string) => {
      const query = tableMap[table];
      if (!query) {
        throw new Error(`Unexpected table: ${table}`);
      }
      return query;
    },
  };
}

beforeEach(() => {
  mocked.requireAdmin.mockReset();
  mocked.createServiceClient.mockReset();
  mocked.requireAdmin.mockResolvedValue({ user: { id: "admin-user" } });
});

describe("schools routes", () => {
  it("GET applies default active status and all filters", async () => {
    const query = new QueryStub();
    query.result = { data: [{ id: 1 }], error: null, count: 1 };
    mocked.createServiceClient.mockReturnValue(buildClient({ schools: query }));

    const req = new NextRequest(
      "http://localhost/api/v1/schools?country=英国&city=伦敦&school_type=艺术学院&keyword=皇家&min_rank=1&max_rank=20&limit=10&offset=20"
    );
    const res = await getSchools(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
    expect(query.operations).toEqual(
      expect.arrayContaining([
        { method: "eq", args: ["status", "active"] },
        { method: "eq", args: ["country", "英国"] },
        { method: "eq", args: ["city", "伦敦"] },
        { method: "eq", args: ["school_type", "艺术学院"] },
        { method: "or", args: ["name_zh.ilike.%皇家%,name_en.ilike.%皇家%"] },
        { method: "gte", args: ["qs_art_rank", 1] },
        { method: "lte", args: ["qs_art_rank", 20] },
        { method: "range", args: [20, 29] },
      ])
    );
  });

  it("GET rejects invalid pagination", async () => {
    const req = new NextRequest("http://localhost/api/v1/schools?limit=0");
    const res = await getSchools(req);
    expect(res.status).toBe(400);
  });

  it("GET resolves short school aliases before fuzzy search", async () => {
    const query = new QueryStub();
    query.result = { data: [{ id: "ual-id", slug: "university-arts-london" }], error: null, count: 1 };
    mocked.createServiceClient.mockReturnValue(buildClient({ schools: query }));

    const req = new NextRequest("http://localhost/api/v1/schools?keyword=UAL");
    const res = await getSchools(req);

    expect(res.status).toBe(200);
    expect(query.operations).toEqual(
      expect.arrayContaining([
        { method: "in", args: ["slug", ["university-arts-london"]] },
      ])
    );
    expect(query.operations).not.toEqual(
      expect.arrayContaining([
        { method: "or", args: ["name_zh.ilike.%UAL%,name_en.ilike.%UAL%"] },
      ])
    );
  });

  it("GET include_inactive requires admin", async () => {
    mocked.requireAdmin.mockResolvedValue({
      response: NextResponse.json({ success: false, error: "需要管理员权限" }, { status: 403 }),
    });
    const req = new NextRequest("http://localhost/api/v1/schools?include_inactive=true");
    const res = await getSchools(req);
    expect(res.status).toBe(403);
  });

  it("POST creates school for admin", async () => {
    const query = new QueryStub();
    query.singleResult = { data: { id: 88, name_zh: "测试院校" }, error: null };
    mocked.createServiceClient.mockReturnValue(buildClient({ schools: query }));

    const req = new NextRequest("http://localhost/api/v1/schools", {
      method: "POST",
      body: JSON.stringify({ name_zh: "测试院校", status: "active" }),
    });
    const res = await postSchools(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(query.operations).toEqual(
      expect.arrayContaining([{ method: "insert", args: [{ name_zh: "测试院校", status: "active" }] }])
    );
  });

  it("GET /schools/[id] rejects non-integer id", async () => {
    mocked.createServiceClient.mockReturnValue(buildClient({ schools: new QueryStub() }));
    const req = new NextRequest("http://localhost/api/v1/schools/abc");
    const res = await getSchoolById(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(400);
  });

  it("PATCH /schools/[id] requires admin", async () => {
    mocked.requireAdmin.mockResolvedValue({
      response: NextResponse.json({ success: false, error: "未授权" }, { status: 401 }),
    });
    const req = new NextRequest("http://localhost/api/v1/schools/1", {
      method: "PATCH",
      body: JSON.stringify({ name_zh: "new" }),
    });
    const res = await patchSchoolById(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });
});

describe("programs routes", () => {
  it("GET applies filter conditions and defaults to active only", async () => {
    const query = new QueryStub();
    query.result = { data: [{ id: 2 }], error: null, count: 1 };
    mocked.createServiceClient.mockReturnValue(buildClient({ programs: query }));

    const req = new NextRequest(
      "http://localhost/api/v1/programs?school_id=1&category_id=3&degree_type=MA&requires_portfolio=true&keyword=动画&limit=5&offset=10"
    );
    const res = await getPrograms(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(query.operations).toEqual(
      expect.arrayContaining([
        { method: "eq", args: ["status", "active"] },
        { method: "eq", args: ["school_id", 1] },
        { method: "eq", args: ["degree_type", "MA"] },
        { method: "ilike", args: ["program_name", "%动画%"] },
        { method: "eq", args: ["requires_portfolio", true] },
        { method: "eq", args: ["program_art_categories.category_id", 3] },
        { method: "range", args: [10, 14] },
      ])
    );
  });

  it("GET rejects invalid requires_portfolio", async () => {
    const req = new NextRequest("http://localhost/api/v1/programs?requires_portfolio=yes");
    const res = await getPrograms(req);
    expect(res.status).toBe(400);
  });

  it("GET include_inactive requires admin", async () => {
    mocked.requireAdmin.mockResolvedValue({
      response: NextResponse.json({ success: false, error: "需要管理员权限" }, { status: 403 }),
    });
    const req = new NextRequest("http://localhost/api/v1/programs?include_inactive=true");
    const res = await getPrograms(req);
    expect(res.status).toBe(403);
  });

  it("POST requires admin and inserts record", async () => {
    const query = new QueryStub();
    query.singleResult = { data: { id: 9, program_name: "MFA" }, error: null };
    mocked.createServiceClient.mockReturnValue(buildClient({ programs: query }));

    const req = new NextRequest("http://localhost/api/v1/programs", {
      method: "POST",
      body: JSON.stringify({ school_id: 1, program_name: "MFA", status: "active" }),
    });
    const res = await postPrograms(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(query.operations).toEqual(
      expect.arrayContaining([
        { method: "insert", args: [{ school_id: 1, program_name: "MFA", status: "active" }] },
      ])
    );
  });

  it("GET /programs/[id] returns 404 when not found", async () => {
    const query = new QueryStub();
    query.maybeSingleResult = { data: null, error: null };
    mocked.createServiceClient.mockReturnValue(buildClient({ programs: query }));

    const req = new NextRequest("http://localhost/api/v1/programs/999");
    const res = await getProgramById(req, { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });

  it("DELETE /programs/[id] deletes record for admin", async () => {
    const query = new QueryStub();
    query.result = { data: null, error: null };
    mocked.createServiceClient.mockReturnValue(buildClient({ programs: query }));

    const req = new NextRequest("http://localhost/api/v1/programs/2", { method: "DELETE" });
    const res = await deleteProgramById(req, { params: Promise.resolve({ id: "2" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(query.operations).toEqual(
      expect.arrayContaining([
        { method: "delete", args: [] },
        { method: "eq", args: ["id", 2] },
      ])
    );
  });
});
