import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as getOrganization } from "@/app/api/v1/organizations/[id]/route";

type Row = Record<string, unknown>;

const ORG_ID = "50000000-0000-4000-8000-000000000001";
const EXPIRED_ORG_ID = "50000000-0000-4000-8000-000000000002";
const organizations: Row[] = [
  {
    id: ORG_ID,
    name: "艺见伦敦申请中心",
    status: "active",
    city: "上海",
    province: "上海",
    focus_areas: ["uk", "portfolio", "rca"],
    supports_online: true,
    supports_offline: true,
    rating: 4.8,
    review_count: 32,
    contract_count: 6,
    subscription_status: "active",
    subscription_expires_at: "2099-01-01T00:00:00.000Z",
    metadata: {
      address: "上海市静安区 88 号",
      phone: "021-0000",
      wechat_qr_url: "https://cdn.example.test/qr.png",
      summary: "专注英国艺术院校申请。",
    },
  },
  {
    id: EXPIRED_ORG_ID,
    name: "过期机构",
    status: "active",
    city: "上海",
    province: "上海",
    focus_areas: ["uk"],
    supports_online: true,
    supports_offline: true,
    rating: 5,
    review_count: 2,
    contract_count: 1,
    subscription_status: "active",
    subscription_expires_at: "2020-01-01T00:00:00.000Z",
    metadata: {},
  },
];

const consultationReviews: Row[] = [
  {
    id: "review-1",
    organization_id: ORG_ID,
    user_id: "student-1",
    rating: 5,
    body: "老师回复很快，作品集方向讲得清楚。",
    created_at: "2026-06-14T10:00:00.000Z",
    consultation: { target_name: "RCA 服务设计" },
  },
  {
    id: "review-2",
    organization_id: ORG_ID,
    user_id: "student-2",
    rating: 4,
    body: "线下沟通比较细。",
    created_at: "2026-06-13T10:00:00.000Z",
    consultation: { target_name: "UAL 插画" },
  },
];

const profiles = new Map<string, Row>([
  [
    "member-user",
    {
      id: "member-user",
      membership_status: "member",
      membership_started_at: "2026-06-14T12:00:00.000Z",
      membership_expires_at: "2027-06-14T12:00:00.000Z",
    },
  ],
]);

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: async (req: NextRequest) => {
    const h = req.headers.get("authorization");
    if (h === "Bearer member-token") return { id: "member-user" } as { id: string };
    return null;
  },
}));

class QueryStub {
  private filters: Array<{ field: string; value: unknown }> = [];
  private limitCount: number | null = null;

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

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async maybeSingle() {
    const rows = this.rowsForTable();
    return { data: rows.find((row) => this.matches(row)) ?? null, error: null };
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: Row[]; count: number; error: null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    const rows = this.rowsForTable().filter((row) => this.matches(row));
    const limited =
      this.limitCount == null ? rows : rows.slice(0, this.limitCount);
    return Promise.resolve({
      data: limited,
      count: limited.length,
      error: null,
    }).then(onfulfilled, onrejected);
  }

  private rowsForTable() {
    if (this.table === "organizations") return organizations;
    if (this.table === "consultation_reviews") return consultationReviews;
    return Array.from(profiles.values());
  }

  private matches(row: Row) {
    return this.filters.every(({ field, value }) => row[field] === value);
  }
}

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: (table: string) => new QueryStub(table),
  }),
}));

function ctx(id = ORG_ID) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/v1/organizations/:id", () => {
  it("非会员可看机构详情但联系方式锁定", async () => {
    const req = new NextRequest(`http://localhost/api/v1/organizations/${ORG_ID}`);
    const res = await getOrganization(req, ctx());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.name).toBe("艺见伦敦申请中心");
    expect(body.data.contact_locked).toBe(true);
    expect(body.data.address).toBeNull();
    expect(body.data.phone).toBeNull();
    expect(body.data.reviews).toHaveLength(2);
    expect(body.data.reviews[0]).toEqual({
      id: "review-1",
      rating: 5,
      body: "老师回复很快，作品集方向讲得清楚。",
      target_name: "RCA 服务设计",
      created_at: "2026-06-14T10:00:00.000Z",
    });
    expect(body.data.reviews[0].user_id).toBeUndefined();
  });

  it("会员可查看线下联系方式", async () => {
    const req = new NextRequest(`http://localhost/api/v1/organizations/${ORG_ID}`, {
      headers: { authorization: "Bearer member-token" },
    });
    const res = await getOrganization(req, ctx());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.contact_locked).toBe(false);
    expect(body.data.address).toBe("上海市静安区 88 号");
    expect(body.data.phone).toBe("021-0000");
    expect(body.data.wechat_qr_url).toBe("https://cdn.example.test/qr.png");
  });

  it("无效 id 返回 400", async () => {
    const req = new NextRequest("http://localhost/api/v1/organizations/bad-id");
    const res = await getOrganization(req, ctx("bad-id"));
    expect(res.status).toBe(400);
  });

  it("过期入驻机构不公开展示", async () => {
    const req = new NextRequest(
      `http://localhost/api/v1/organizations/${EXPIRED_ORG_ID}`
    );
    const res = await getOrganization(req, ctx(EXPIRED_ORG_ID));
    expect(res.status).toBe(404);
  });
});
