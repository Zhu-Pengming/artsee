import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as postMentorApplication } from "@/app/api/v1/me/mentor-applications/route";
import { GET as getMentors } from "@/app/api/v1/mentors/route";
import { POST as postMentorService } from "@/app/api/v1/me/mentor/services/route";
import { GET as getAdminMentors } from "@/app/api/v1/admin/mentors/route";
import { POST as reviewMentor } from "@/app/api/v1/admin/mentors/[id]/review/route";
import { POST as bookMentor } from "@/app/api/v1/mentors/[id]/bookings/route";
import { GET as getMyMentorBookings } from "@/app/api/v1/me/mentor/bookings/route";
import { PATCH as patchMentorBooking } from "@/app/api/v1/me/mentor/bookings/[id]/route";
import { POST as postMentorReview } from "@/app/api/v1/me/mentor/bookings/[id]/review/route";
import { POST as postMentorAvailability } from "@/app/api/v1/me/mentor/availability/route";
import { GET as getMentorAvailability } from "@/app/api/v1/mentors/[id]/availability/route";
import { POST as confirmOrder } from "@/app/api/v1/orders/[id]/confirm/route";
import { GET as getMentorEarnings } from "@/app/api/v1/me/mentor/earnings/route";
import { POST as postMentorWithdrawal } from "@/app/api/v1/me/mentor/withdrawals/route";
import { GET as getAdminMentorWithdrawals } from "@/app/api/v1/admin/mentor-withdrawals/route";
import { POST as reviewAdminMentorWithdrawal } from "@/app/api/v1/admin/mentor-withdrawals/[id]/review/route";

type Row = Record<string, unknown>;

const STUDENT_ID = "30000000-0000-4000-8000-000000000001";
const MENTOR_USER_ID = "30000000-0000-4000-8000-000000000002";
const ADMIN_ID = "30000000-0000-4000-8000-000000000003";
const OTHER_ID = "30000000-0000-4000-8000-000000000004";
const MENTOR_ID = "30000000-0000-4000-8000-000000000010";
const SERVICE_ID = "30000000-0000-4000-8000-000000000020";
const BOOKING_ID = "30000000-0000-4000-8000-000000000030";
const SLOT_ID = "30000000-0000-4000-8000-000000000040";
const ORDER_ID = "30000000-0000-4000-8000-000000000050";
const EARNING_ID = "30000000-0000-4000-8000-000000000060";
const WITHDRAWAL_ID = "30000000-0000-4000-8000-000000000070";

const tokenUsers: Record<string, string> = {
  student: STUDENT_ID,
  mentor: MENTOR_USER_ID,
  admin: ADMIN_ID,
  other: OTHER_ID,
};

const db: Record<string, Row[]> = {
  user_profiles: [],
  mentors: [],
  mentor_services: [],
  mentor_bookings: [],
  mentor_reviews: [],
  mentor_availability_slots: [],
  orders: [],
  mentor_earnings: [],
  mentor_withdrawal_requests: [],
  notifications: [],
};

function resetDb() {
  db.user_profiles = [
    { id: STUDENT_ID, role: "user", user_role: "student" },
    { id: MENTOR_USER_ID, role: "user", user_role: "student" },
    { id: ADMIN_ID, role: "admin", user_role: null },
    { id: OTHER_ID, role: "user", user_role: "student" },
  ];
  db.mentors = [];
  db.mentor_services = [];
  db.mentor_bookings = [];
  db.mentor_reviews = [];
  db.mentor_availability_slots = [];
  db.orders = [];
  db.mentor_earnings = [];
  db.mentor_withdrawal_requests = [];
  db.notifications = [];
}

class QueryStub {
  private filters: Array<{ field: string; value: unknown; op: "eq" | "in" }> = [];
  private patch: Row | null = null;
  private inserted: Row | null = null;
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
    const id =
      this.table === "mentors"
        ? MENTOR_ID
        : this.table === "mentor_services"
          ? SERVICE_ID
          : this.table === "mentor_bookings"
            ? BOOKING_ID
            : this.table === "mentor_availability_slots"
              ? SLOT_ID
              : this.table === "orders"
                ? ORDER_ID
                : this.table === "mentor_earnings"
                  ? EARNING_ID
                  : this.table === "mentor_withdrawal_requests"
                    ? WITHDRAWAL_ID
          : `${this.table}-${db[this.table].length + 1}`;
    this.inserted = { id, ...row };
    db[this.table].push(this.inserted);
    return this;
  }

  upsert(row: Row) {
    const rows = db[this.table];
    const index = rows.findIndex((item) => item.user_id === row.user_id);
    const next = { id: index >= 0 ? rows[index].id : MENTOR_ID, ...row };
    if (index >= 0) rows[index] = { ...rows[index], ...next };
    else rows.push(next);
    this.inserted = next;
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
      return { data: this.inserted, error: null };
    }
    if (!this.patch) {
      const row = this.findRows()[0] ?? null;
      return { data: row, error: row ? null : { message: "not found" } };
    }
    const rows = db[this.table];
    const index = rows.findIndex((row) => this.matches(row));
    if (index < 0) return { data: null, error: { message: "not found" } };
    rows[index] = { ...rows[index], ...this.patch };
    return { data: rows[index], error: null };
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: Row[]; count: number; error: null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    const allRows = this.findRows().map((row) => {
      if (this.table === "mentors") {
        return {
          ...row,
          services: db.mentor_services.filter((service) => service.mentor_id === row.id),
        };
      }
      return row;
    });
    const rows =
      this.rangeEnd == null
        ? allRows
        : allRows.slice(this.rangeStart, this.rangeEnd + 1);
    return Promise.resolve({ data: rows, count: allRows.length, error: null }).then(
      onfulfilled,
      onrejected
    );
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

describe("mentor minimal flow", () => {
  beforeEach(resetDb);

  it("creates a pending mentor application", async () => {
    const res = await postMentorApplication(
      req("/api/v1/me/mentor-applications", "mentor", "POST", {
        display_name: "张导师",
        university: "RCA",
        major: "Service Design",
      })
    );
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.data.user_id).toBe(MENTOR_USER_ID);
    expect(body.data.verification_status).toBe("pending");
    expect(body.data.status).toBe("draft");
  });

  it("lets a mentor create services after applying", async () => {
    db.mentors = [{ id: MENTOR_ID, user_id: MENTOR_USER_ID, status: "draft" }];
    const res = await postMentorService(
      req("/api/v1/me/mentor/services", "mentor", "POST", {
        title: "作品集评估",
        duration_minutes: 60,
        price_amount: 50000,
      })
    );
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.data.mentor_id).toBe(MENTOR_ID);
    expect(body.data.status).toBe("active");
  });

  it("allows admins to approve mentors and exposes them publicly", async () => {
    db.mentors = [
      {
        id: MENTOR_ID,
        user_id: MENTOR_USER_ID,
        display_name: "张导师",
        status: "draft",
        verification_status: "pending",
      },
    ];
    const denied = await getAdminMentors(req("/api/v1/admin/mentors", "mentor"));
    expect(denied.status).toBe(403);

    const pendingList = await getAdminMentors(
      req("/api/v1/admin/mentors?verification_status=pending", "admin")
    );
    const pendingBody = await pendingList.json();
    expect(pendingList.status).toBe(200);
    expect(pendingBody.data).toHaveLength(1);
    expect(pendingBody.data[0].id).toBe(MENTOR_ID);

    const reviewed = await reviewMentor(
      req(`/api/v1/admin/mentors/${MENTOR_ID}/review`, "admin", "POST", {
        status: "approved",
      }),
      ctx(MENTOR_ID)
    );
    expect(reviewed.status).toBe(200);
    const list = await getMentors(req("/api/v1/mentors", null));
    const body = await list.json();
    expect(list.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].status).toBe("active");
  });

  it("lets students book active services from verified mentors", async () => {
    db.mentors = [
      {
        id: MENTOR_ID,
        user_id: MENTOR_USER_ID,
        display_name: "张导师",
        status: "active",
        verification_status: "verified",
      },
    ];
    db.mentor_services = [
      {
        id: SERVICE_ID,
        mentor_id: MENTOR_ID,
        title: "作品集评估",
        service_type: "portfolio_review",
        duration_minutes: 60,
        price_amount: 50000,
        currency: "cny",
        status: "active",
      },
    ];
    const res = await bookMentor(
      req(`/api/v1/mentors/${MENTOR_ID}/bookings`, "student", "POST", {
        service_id: SERVICE_ID,
        student_note: "想看服务设计作品集",
      }),
      ctx(MENTOR_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.data.mentor_id).toBe(MENTOR_ID);
    expect(body.data.student_user_id).toBe(STUDENT_ID);
    expect(db.notifications).toHaveLength(1);
  });

  it("lists mentor bookings for both students and mentor owners", async () => {
    db.mentors = [
      {
        id: MENTOR_ID,
        user_id: MENTOR_USER_ID,
        display_name: "张导师",
        status: "active",
        verification_status: "verified",
      },
    ];
    db.mentor_services = [
      {
        id: SERVICE_ID,
        mentor_id: MENTOR_ID,
        title: "作品集评估",
        service_type: "portfolio_review",
        status: "active",
      },
    ];
    db.mentor_bookings = [
      {
        id: BOOKING_ID,
        mentor_id: MENTOR_ID,
        mentor_service_id: SERVICE_ID,
        student_user_id: STUDENT_ID,
        status: "requested",
        created_at: "2026-06-12T10:00:00.000Z",
      },
    ];

    const studentRes = await getMyMentorBookings(
      req("/api/v1/me/mentor/bookings?role=student", "student")
    );
    const studentBody = await studentRes.json();
    expect(studentRes.status).toBe(200);
    expect(studentBody.data).toHaveLength(1);
    expect(studentBody.data[0].service.title).toBe("作品集评估");

    const mentorRes = await getMyMentorBookings(
      req("/api/v1/me/mentor/bookings?role=mentor", "mentor")
    );
    const mentorBody = await mentorRes.json();
    expect(mentorRes.status).toBe(200);
    expect(mentorBody.data).toHaveLength(1);
    expect(mentorBody.data[0].student_user_id).toBe(STUDENT_ID);
  });

  it("lets mentor owners confirm bookings and notifies students", async () => {
    db.mentors = [
      {
        id: MENTOR_ID,
        user_id: MENTOR_USER_ID,
        display_name: "张导师",
        status: "active",
        verification_status: "verified",
      },
    ];
    db.mentor_bookings = [
      {
        id: BOOKING_ID,
        mentor_id: MENTOR_ID,
        mentor_service_id: SERVICE_ID,
        student_user_id: STUDENT_ID,
        status: "requested",
        metadata: {},
      },
    ];

    const res = await patchMentorBooking(
      req(`/api/v1/me/mentor/bookings/${BOOKING_ID}`, "mentor", "PATCH", {
        status: "confirmed",
        advisor_note: "周五晚上可以",
      }),
      ctx(BOOKING_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.status).toBe("confirmed");
    expect(body.data.advisor_note).toBe("周五晚上可以");
    expect(db.notifications).toHaveLength(1);
    expect(db.notifications[0].user_id).toBe(STUDENT_ID);
  });

  it("lets students cancel their own bookings but hides them from unrelated users", async () => {
    db.mentors = [
      {
        id: MENTOR_ID,
        user_id: MENTOR_USER_ID,
        display_name: "张导师",
        status: "active",
        verification_status: "verified",
      },
    ];
    db.mentor_bookings = [
      {
        id: BOOKING_ID,
        mentor_id: MENTOR_ID,
        mentor_service_id: SERVICE_ID,
        student_user_id: STUDENT_ID,
        status: "requested",
        metadata: {},
      },
    ];

    const denied = await patchMentorBooking(
      req(`/api/v1/me/mentor/bookings/${BOOKING_ID}`, "other", "PATCH", {
        status: "confirmed",
      }),
      ctx(BOOKING_ID)
    );
    expect(denied.status).toBe(404);

    const canceled = await patchMentorBooking(
      req(`/api/v1/me/mentor/bookings/${BOOKING_ID}`, "student", "PATCH", {
        status: "canceled",
        student_note: "时间冲突",
      }),
      ctx(BOOKING_ID)
    );
    const body = await canceled.json();
    expect(canceled.status).toBe(200);
    expect(body.data.status).toBe("canceled");
    expect(body.data.student_note).toBe("时间冲突");
    expect(db.notifications.at(-1)?.user_id).toBe(MENTOR_USER_ID);
  });

  it("lets students review completed mentor bookings and updates mentor rating", async () => {
    db.mentors = [
      {
        id: MENTOR_ID,
        user_id: MENTOR_USER_ID,
        display_name: "张导师",
        status: "active",
        verification_status: "verified",
        rating: 0,
        review_count: 0,
      },
    ];
    db.mentor_bookings = [
      {
        id: BOOKING_ID,
        mentor_id: MENTOR_ID,
        mentor_service_id: SERVICE_ID,
        student_user_id: STUDENT_ID,
        status: "completed",
      },
    ];

    const res = await postMentorReview(
      req(`/api/v1/me/mentor/bookings/${BOOKING_ID}/review`, "student", "POST", {
        rating: 5,
        body: "反馈很具体",
      }),
      ctx(BOOKING_ID)
    );
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.data.rating).toBe(5);
    expect(body.mentor.rating).toBe(5);
    expect(db.mentor_reviews).toHaveLength(1);
    expect(db.mentors[0].rating).toBe(5);
    expect(db.mentors[0].review_count).toBe(1);
    expect(db.notifications.at(-1)?.user_id).toBe(MENTOR_USER_ID);

    const duplicate = await postMentorReview(
      req(`/api/v1/me/mentor/bookings/${BOOKING_ID}/review`, "student", "POST", {
        rating: 4,
      }),
      ctx(BOOKING_ID)
    );
    expect(duplicate.status).toBe(409);
  });

  it("lets mentors publish availability slots and students reserve them", async () => {
    db.mentors = [
      {
        id: MENTOR_ID,
        user_id: MENTOR_USER_ID,
        display_name: "张导师",
        status: "active",
        verification_status: "verified",
      },
    ];
    db.mentor_services = [
      {
        id: SERVICE_ID,
        mentor_id: MENTOR_ID,
        title: "作品集评估",
        service_type: "portfolio_review",
        status: "active",
      },
    ];

    const createdSlot = await postMentorAvailability(
      req("/api/v1/me/mentor/availability", "mentor", "POST", {
        starts_at: "2026-07-01T10:00:00.000Z",
        ends_at: "2026-07-01T11:00:00.000Z",
      })
    );
    expect(createdSlot.status).toBe(201);
    expect(db.mentor_availability_slots[0].status).toBe("open");

    const publicSlots = await getMentorAvailability(
      req(`/api/v1/mentors/${MENTOR_ID}/availability`, null),
      ctx(MENTOR_ID)
    );
    const publicBody = await publicSlots.json();
    expect(publicSlots.status).toBe(200);
    expect(publicBody.data).toHaveLength(1);

    const booked = await bookMentor(
      req(`/api/v1/mentors/${MENTOR_ID}/bookings`, "student", "POST", {
        service_id: SERVICE_ID,
        availability_slot_id: SLOT_ID,
      }),
      ctx(MENTOR_ID)
    );
    const bookedBody = await booked.json();
    expect(booked.status).toBe(201);
    expect(bookedBody.data.scheduled_at).toBe("2026-07-01T10:00:00.000Z");
    expect(db.mentor_availability_slots[0].status).toBe("reserved");

    const canceled = await patchMentorBooking(
      req(`/api/v1/me/mentor/bookings/${BOOKING_ID}`, "student", "PATCH", {
        status: "canceled",
      }),
      ctx(BOOKING_ID)
    );
    expect(canceled.status).toBe(200);
    expect(db.mentor_availability_slots[0].status).toBe("open");
  });

  it("creates orders for paid mentor bookings and releases earnings after completion", async () => {
    db.mentors = [
      {
        id: MENTOR_ID,
        user_id: MENTOR_USER_ID,
        display_name: "张导师",
        status: "active",
        verification_status: "verified",
      },
    ];
    db.mentor_services = [
      {
        id: SERVICE_ID,
        mentor_id: MENTOR_ID,
        title: "作品集评估",
        service_type: "portfolio_review",
        duration_minutes: 60,
        price_amount: 50000,
        currency: "cny",
        status: "active",
      },
    ];

    const booked = await bookMentor(
      req(`/api/v1/mentors/${MENTOR_ID}/bookings`, "student", "POST", {
        service_id: SERVICE_ID,
      }),
      ctx(MENTOR_ID)
    );
    const bookingBody = await booked.json();
    expect(booked.status).toBe(201);
    expect(bookingBody.data.order_id).toBe(ORDER_ID);
    expect(bookingBody.data.payment_status).toBe("unpaid");
    expect(db.orders[0].item_type).toBe("mentor_booking");
    expect(db.orders[0].amount_total).toBe(50000);

    const paid = await confirmOrder(
      req(`/api/v1/orders/${ORDER_ID}/confirm`, "student", "POST"),
      ctx(ORDER_ID)
    );
    const paidBody = await paid.json();
    expect(paid.status).toBe(200);
    expect(paidBody.data.status).toBe("paid");
    expect(db.mentor_bookings[0].payment_status).toBe("paid");
    expect(db.mentor_earnings[0].status).toBe("pending");
    expect(db.mentor_earnings[0].platform_fee_amount).toBe(5000);
    expect(db.mentor_earnings[0].net_amount).toBe(45000);

    const completed = await patchMentorBooking(
      req(`/api/v1/me/mentor/bookings/${BOOKING_ID}`, "mentor", "PATCH", {
        status: "completed",
      }),
      ctx(BOOKING_ID)
    );
    expect(completed.status).toBe(200);
    expect(db.mentor_earnings[0].status).toBe("available");
  });

  it("summarizes mentor earnings and creates withdrawal requests within balance", async () => {
    db.mentors = [
      {
        id: MENTOR_ID,
        user_id: MENTOR_USER_ID,
        display_name: "张导师",
      },
    ];
    db.mentor_earnings = [
      {
        id: EARNING_ID,
        mentor_id: MENTOR_ID,
        mentor_booking_id: BOOKING_ID,
        order_id: ORDER_ID,
        net_amount: 45000,
        gross_amount: 50000,
        platform_fee_amount: 5000,
        currency: "cny",
        status: "available",
        created_at: "2026-06-12T10:00:00.000Z",
      },
      {
        id: "30000000-0000-4000-8000-000000000061",
        mentor_id: MENTOR_ID,
        mentor_booking_id: "30000000-0000-4000-8000-000000000031",
        order_id: "30000000-0000-4000-8000-000000000051",
        net_amount: 18000,
        gross_amount: 20000,
        platform_fee_amount: 2000,
        currency: "cny",
        status: "pending",
        created_at: "2026-06-12T11:00:00.000Z",
      },
    ];

    const overview = await getMentorEarnings(
      req("/api/v1/me/mentor/earnings", "mentor")
    );
    const overviewBody = await overview.json();
    expect(overview.status).toBe(200);
    expect(overviewBody.summary.available_amount).toBe(45000);
    expect(overviewBody.summary.pending_amount).toBe(18000);
    expect(overviewBody.summary.withdrawable_amount).toBe(45000);

    const tooMuch = await postMentorWithdrawal(
      req("/api/v1/me/mentor/withdrawals", "mentor", "POST", {
        amount: 50000,
      })
    );
    expect(tooMuch.status).toBe(400);

    const requested = await postMentorWithdrawal(
      req("/api/v1/me/mentor/withdrawals", "mentor", "POST", {
        amount: 30000,
      })
    );
    const requestedBody = await requested.json();
    expect(requested.status).toBe(201);
    expect(requestedBody.data.amount).toBe(30000);

    const after = await getMentorEarnings(
      req("/api/v1/me/mentor/earnings", "mentor")
    );
    const afterBody = await after.json();
    expect(afterBody.summary.requested_withdrawal_amount).toBe(30000);
    expect(afterBody.summary.withdrawable_amount).toBe(15000);
  });

  it("lets admins review and mark mentor withdrawals as paid", async () => {
    db.mentors = [
      {
        id: MENTOR_ID,
        user_id: MENTOR_USER_ID,
        display_name: "张导师",
      },
    ];
    db.mentor_earnings = [
      {
        id: EARNING_ID,
        mentor_id: MENTOR_ID,
        mentor_booking_id: BOOKING_ID,
        order_id: ORDER_ID,
        net_amount: 45000,
        gross_amount: 50000,
        platform_fee_amount: 5000,
        currency: "cny",
        status: "available",
      },
    ];
    db.mentor_withdrawal_requests = [
      {
        id: WITHDRAWAL_ID,
        mentor_id: MENTOR_ID,
        requested_by_user_id: MENTOR_USER_ID,
        amount: 30000,
        currency: "cny",
        status: "requested",
        created_at: "2026-06-12T12:00:00.000Z",
      },
    ];

    const denied = await getAdminMentorWithdrawals(
      req("/api/v1/admin/mentor-withdrawals", "mentor")
    );
    expect(denied.status).toBe(403);

    const list = await getAdminMentorWithdrawals(
      req("/api/v1/admin/mentor-withdrawals", "admin")
    );
    const listBody = await list.json();
    expect(list.status).toBe(200);
    expect(listBody.data).toHaveLength(1);

    const approved = await reviewAdminMentorWithdrawal(
      req(`/api/v1/admin/mentor-withdrawals/${WITHDRAWAL_ID}/review`, "admin", "POST", {
        status: "approved",
        review_note: "资料齐全",
      }),
      ctx(WITHDRAWAL_ID)
    );
    const approvedBody = await approved.json();
    expect(approved.status).toBe(200);
    expect(approvedBody.data.status).toBe("approved");
    expect(approvedBody.data.reviewed_by_user_id).toBe(ADMIN_ID);

    const paid = await reviewAdminMentorWithdrawal(
      req(`/api/v1/admin/mentor-withdrawals/${WITHDRAWAL_ID}/review`, "admin", "POST", {
        status: "paid",
      }),
      ctx(WITHDRAWAL_ID)
    );
    const paidBody = await paid.json();
    expect(paid.status).toBe(200);
    expect(paidBody.data.status).toBe("paid");
    expect(paidBody.data.paid_by_user_id).toBe(ADMIN_ID);
    expect(db.notifications.at(-1)?.user_id).toBe(MENTOR_USER_ID);

    const earnings = await getMentorEarnings(
      req("/api/v1/me/mentor/earnings", "mentor")
    );
    const earningsBody = await earnings.json();
    expect(earningsBody.summary.withdrawn_amount).toBe(30000);
    expect(earningsBody.summary.withdrawable_amount).toBe(15000);
  });
});
