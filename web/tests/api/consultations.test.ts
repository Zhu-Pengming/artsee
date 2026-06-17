import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as createConsultation } from "@/app/api/v1/me/consultations/route";

const ORG_ID = "50000000-0000-4000-8000-000000000001";
const EXPIRED_ORG_ID = "50000000-0000-4000-8000-000000000002";
const INACTIVE_SUBSCRIPTION_ORG_ID = "50000000-0000-4000-8000-000000000003";
const CONSULTATION_ID = "60000000-0000-4000-8000-000000000001";
const notifyHandlers = vi.hoisted(() => vi.fn());
const organizations = [
  {
    id: ORG_ID,
    name: "艺见伦敦申请中心",
    status: "active",
    supports_online: true,
    subscription_status: "active",
    subscription_expires_at: "2099-01-01T00:00:00.000Z",
  },
  {
    id: EXPIRED_ORG_ID,
    name: "过期机构",
    status: "active",
    supports_online: true,
    subscription_status: "active",
    subscription_expires_at: "2020-01-01T00:00:00.000Z",
  },
  {
    id: INACTIVE_SUBSCRIPTION_ORG_ID,
    name: "未续费机构",
    status: "active",
    supports_online: true,
    subscription_status: "inactive",
    subscription_expires_at: null,
  },
];

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: async (req: NextRequest) => {
    const h = req.headers.get("authorization");
    if (h === "Bearer student-token") return { id: "student-user" } as { id: string };
    return null;
  },
}));

vi.mock("@/lib/api/membership", () => ({
  getUserMembership: async () => ({
    data: { is_member: true, status: "member" },
    error: null,
  }),
}));

vi.mock("@/lib/api/notifications", () => ({
  notifyConsultationHandlers: notifyHandlers,
}));

class QueryStub {
  private payload: Record<string, unknown> | null = null;
  private filters: Array<{ field: string; value: unknown }> = [];

  constructor(private readonly table: string) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, value });
    return this;
  }

  async maybeSingle() {
    if (this.table === "organizations") {
      return {
        data: organizations.find((row) => this.matches(row)) ?? null,
        error: null,
      };
    }
    return { data: null, error: null };
  }

  insert(payload: Record<string, unknown>) {
    this.payload = payload;
    if (this.table === "consultation_messages") {
      return { error: null };
    }
    return {
      select: () => ({
        single: async () => ({
          data: {
            id: CONSULTATION_ID,
            ...this.payload,
          },
          error: null,
        }),
      }),
    };
  }

  private matches(row: Record<string, unknown>) {
    return this.filters.every(({ field, value }) => row[field] === value);
  }
}

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => ({
    from: (table: string) => new QueryStub(table),
  }),
}));

function req(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/v1/me/consultations", {
    method: "POST",
    headers: { authorization: "Bearer student-token" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/me/consultations", () => {
  beforeEach(() => {
    notifyHandlers.mockClear();
  });

  it("会员向机构发起线上咨询后通知机构处理人", async () => {
    const res = await createConsultation(
      req({
        target_type: "school",
        target_name: "RCA",
        organization_id: ORG_ID,
        message: "想咨询服务设计申请",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.assigned_to_org_id).toBe(ORG_ID);
    expect(notifyHandlers).toHaveBeenCalledTimes(1);
    expect(notifyHandlers.mock.calls[0][2]).toMatchObject({
      title: "RCA有新咨询",
      content: "想咨询服务设计申请",
      type: "consultation",
      metadata: {
        consultation_id: CONSULTATION_ID,
        target_name: "RCA",
        organization_id: ORG_ID,
      },
    });
    expect(notifyHandlers.mock.calls[0][3]).toBe("student-user");
  });

  it("拒绝向过期或未续费机构发起咨询", async () => {
    const expiredRes = await createConsultation(
      req({
        target_type: "school",
        target_name: "RCA",
        organization_id: EXPIRED_ORG_ID,
        message: "想咨询服务设计申请",
      })
    );
    const expiredBody = await expiredRes.json();
    expect(expiredRes.status).toBe(403);
    expect(expiredBody.error).toBe("该机构尚未完成入驻年费，暂不可咨询");

    const inactiveRes = await createConsultation(
      req({
        target_type: "school",
        target_name: "RCA",
        organization_id: INACTIVE_SUBSCRIPTION_ORG_ID,
        message: "想咨询服务设计申请",
      })
    );
    expect(inactiveRes.status).toBe(403);
    expect(notifyHandlers).not.toHaveBeenCalled();
  });
});
