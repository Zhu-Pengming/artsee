import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as getCaseDetail } from "@/app/api/v1/cases/[id]/route";

type Row = Record<string, unknown>;
type Ctx = { params: Promise<{ id: string }> };

const PUBLISHED_ID = "case-published";
const HIDDEN_ID = "case-hidden";

const cases: Row[] = [
  {
    id: PUBLISHED_ID,
    title: "RCA Service Design offer",
    status: "published",
    result: "admitted",
  },
  {
    id: HIDDEN_ID,
    title: "Hidden case",
    status: "draft",
    result: "admitted",
  },
];

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
      data: cases.find((row) => this.matches(row)) ?? null,
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
  return new NextRequest("http://localhost/api/v1/cases/case-published");
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) } satisfies Ctx;
}

describe("GET /api/v1/cases/:id", () => {
  it("returns published case details", async () => {
    const res = await getCaseDetail(req(), ctx(PUBLISHED_ID));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(PUBLISHED_ID);
  });

  it("does not expose unpublished cases", async () => {
    const res = await getCaseDetail(req(), ctx(HIDDEN_ID));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("未找到");
  });
});
