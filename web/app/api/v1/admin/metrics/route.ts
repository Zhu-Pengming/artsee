import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Row = Record<string, unknown>;

const SNAPSHOT_LIMIT = 2000;

function textValue(value: unknown, fallback = "unknown") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function parseDate(value: unknown) {
  const text = textValue(value, "");
  if (!text) return null;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
}

function productType(row: Row) {
  return textValue(row.product_type, textValue(row.item_type, "unknown"));
}

function effectiveMembershipStatus(row: Row, now: Date) {
  const status = textValue(row.membership_status, "free");
  const expiresAt = parseDate(row.membership_expires_at);
  if (status === "member" && expiresAt && expiresAt <= now) return "expired";
  if (status === "member") return "member";
  if (status === "expired") return "expired";
  return "free";
}

function effectiveSubscriptionStatus(row: Row, now: Date) {
  const status = textValue(row.subscription_status, "inactive");
  const expiresAt = parseDate(row.subscription_expires_at);
  if (status === "active" && expiresAt && expiresAt <= now) return "expired";
  if (status === "active") return "active";
  if (status === "expired") return "expired";
  return "inactive";
}

function countBy(rows: Row[], field: string, fallback = "unknown") {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = textValue(row[field], fallback);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function countEffectiveMembership(rows: Row[], now: Date) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = effectiveMembershipStatus(row, now);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function countEffectiveSubscription(rows: Row[], now: Date) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = effectiveSubscriptionStatus(row, now);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function sumByStatus(rows: Row[], statusField: string, amountField: string, fallback = "unknown") {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = textValue(row[statusField], fallback);
    acc[key] = (acc[key] ?? 0) + numberValue(row[amountField]);
    return acc;
  }, {});
}

function sumByProductType(rows: Row[], amountField: string) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = productType(row);
    acc[key] = (acc[key] ?? 0) + numberValue(row[amountField]);
    return acc;
  }, {});
}

function sumWhere(rows: Row[], amountField: string, predicate: (row: Row) => boolean) {
  return rows.reduce((sum, row) => {
    return predicate(row) ? sum + numberValue(row[amountField]) : sum;
  }, 0);
}

async function fetchRows(table: string, select: string) {
  const { data, error } = await createServiceClient()
    .from(table)
    .select(select)
    .range(0, SNAPSHOT_LIMIT - 1);
  if (error) throw new Error(error.message ?? JSON.stringify(error));
  return (data ?? []) as unknown as Row[];
}

function contentStats(type: string, rows: Row[]) {
  const byStatus = countBy(rows, "status", "draft");
  return {
    type,
    total: rows.length,
    by_status: byStatus,
    reviewing: byStatus.reviewing ?? 0,
    published: byStatus.published ?? 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("response" in admin) return admin.response;
    const now = new Date();

    const [
      users,
      organizations,
      consultations,
      events,
      opportunities,
      artworks,
      artistProfiles,
      verifications,
      mentors,
      mentorBookings,
      orders,
      contracts,
      mentorEarnings,
      withdrawals,
      refunds,
      payoutBatches,
    ] = await Promise.all([
      fetchRows(
        "user_profiles",
        "id,role,status,user_type,user_role,creator_level,content_count,creator_score,membership_status,membership_expires_at,created_at,last_login_at"
      ),
      fetchRows(
        "organizations",
        "id,status,type,city,province,subscription_status,subscription_expires_at,created_at"
      ),
      fetchRows("consultations", "id,status,created_at,updated_at,assigned_to_org_id"),
      fetchRows("events", "id,status,created_at,updated_at"),
      fetchRows("opportunities", "id,status,created_at,updated_at"),
      fetchRows("artworks", "id,status,created_at,updated_at"),
      fetchRows("artist_profiles", "id,status,created_at,updated_at"),
      fetchRows("verifications", "id,type,status,created_at,updated_at"),
      fetchRows("mentors", "id,status,verification_status,created_at,updated_at"),
      fetchRows("mentor_bookings", "id,status,payment_status,created_at,updated_at"),
      fetchRows("orders", "id,status,product_type,item_type,amount_total,currency,created_at,paid_at"),
      fetchRows(
        "contracts",
        "id,status,organization_id,user_id,consultation_id,created_at,signed_at"
      ),
      fetchRows(
        "mentor_earnings",
        "id,status,net_amount,gross_amount,platform_fee_amount,currency,created_at"
      ),
      fetchRows(
        "mentor_withdrawal_requests",
        "id,status,amount,currency,created_at,requested_at"
      ),
      fetchRows(
        "payment_refund_requests",
        "id,status,amount,currency,created_at,requested_at,processed_at"
      ),
      fetchRows("payout_batches", "id,status,total_amount,currency,item_count,created_at,processed_at"),
    ]);

    const content = [
      contentStats("events", events),
      contentStats("opportunities", opportunities),
      contentStats("artworks", artworks),
      contentStats("artists", artistProfiles),
    ];
    const userStatus = countBy(users, "status", "active");
    const membershipStatus = countEffectiveMembership(users, now);
    const organizationSubscriptionStatus = countEffectiveSubscription(
      organizations,
      now
    );
    const creatorLevel = countBy(users, "creator_level", "none");
    const consultationStatus = countBy(consultations, "status", "new");
    const contractStatus = countBy(contracts, "status", "pending");
    const verificationStatus = countBy(verifications, "status", "pending");
    const mentorVerificationStatus = countBy(
      mentors,
      "verification_status",
      "pending"
    );
    const orderStatus = countBy(orders, "status", "pending");
    const orderProductType = orders.reduce<Record<string, number>>((acc, row) => {
      const key = productType(row);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const earningStatus = countBy(mentorEarnings, "status", "pending");
    const withdrawalStatus = countBy(withdrawals, "status", "requested");
    const refundStatus = countBy(refunds, "status", "requested");
    const payoutBatchStatus = countBy(payoutBatches, "status", "draft");

    const contentReviewing = content.reduce((sum, item) => sum + item.reviewing, 0);
    const openConsultations =
      (consultationStatus.new ?? 0) +
      (consultationStatus.pending ?? 0) +
      (consultationStatus.active ?? 0);

    return NextResponse.json({
      success: true,
      generated_at: new Date().toISOString(),
      summary: {
        users_total: users.length,
        users_active: userStatus.active ?? 0,
        users_restricted: (userStatus.banned ?? 0) + (userStatus.disabled ?? 0),
        members_active: membershipStatus.member ?? 0,
        members_expired: membershipStatus.expired ?? 0,
        creators_total:
          (creatorLevel.creator ?? 0) +
          (creatorLevel.active_creator ?? 0) +
          (creatorLevel.opinion_leader ?? 0),
        organizations_total: organizations.length,
        organizations_subscribed: organizationSubscriptionStatus.active ?? 0,
        content_reviewing: contentReviewing,
        verifications_pending: verificationStatus.pending ?? 0,
        consultations_open: openConsultations,
        consultations_converted: consultationStatus.converted ?? 0,
        contracts_total: contracts.length,
        contracts_pending: contractStatus.pending ?? 0,
        contracts_confirmed: contractStatus.confirmed ?? 0,
        mentors_pending: mentorVerificationStatus.pending ?? 0,
        mentor_bookings_requested: countBy(mentorBookings, "status", "requested").requested ?? 0,
        paid_order_amount: sumWhere(orders, "amount_total", (row) => row.status === "paid"),
        paid_membership_amount: sumWhere(
          orders,
          "amount_total",
          (row) => row.status === "paid" && productType(row).startsWith("membership_")
        ),
        paid_org_subscription_amount: sumWhere(
          orders,
          "amount_total",
          (row) => row.status === "paid" && productType(row) === "org_subscription"
        ),
        available_earning_amount: sumWhere(
          mentorEarnings,
          "net_amount",
          (row) => row.status === "available"
        ),
        requested_withdrawal_amount: sumWhere(
          withdrawals,
          "amount",
          (row) => row.status === "requested" || row.status === "approved"
        ),
        requested_refund_amount: sumWhere(
          refunds,
          "amount",
          (row) => row.status === "requested" || row.status === "approved"
        ),
        processing_payout_amount: sumWhere(
          payoutBatches,
          "total_amount",
          (row) => row.status === "processing"
        ),
      },
      sections: {
        users: {
          total: users.length,
          by_status: userStatus,
          by_role: countBy(users, "role", "user"),
          by_user_type: countBy(users, "user_type", "unknown"),
          by_user_role: countBy(users, "user_role", "unknown"),
          by_creator_level: creatorLevel,
          by_membership_status: membershipStatus,
          by_stored_membership_status: countBy(users, "membership_status", "free"),
        },
        organizations: {
          total: organizations.length,
          by_status: countBy(organizations, "status", "active"),
          by_type: countBy(organizations, "type", "unknown"),
          by_subscription_status: organizationSubscriptionStatus,
          by_stored_subscription_status: countBy(
            organizations,
            "subscription_status",
            "inactive"
          ),
        },
        content: {
          total: content.reduce((sum, item) => sum + item.total, 0),
          reviewing: contentReviewing,
          by_type: content,
        },
        verifications: {
          total: verifications.length,
          by_status: verificationStatus,
          by_type: countBy(verifications, "type", "unknown"),
        },
        consultations: {
          total: consultations.length,
          by_status: consultationStatus,
        },
        contracts: {
          total: contracts.length,
          by_status: contractStatus,
        },
        mentors: {
          total: mentors.length,
          by_status: countBy(mentors, "status", "draft"),
          by_verification_status: mentorVerificationStatus,
        },
        commerce: {
          mentor_bookings: {
            total: mentorBookings.length,
            by_status: countBy(mentorBookings, "status", "requested"),
            by_payment_status: countBy(mentorBookings, "payment_status", "unpaid"),
          },
          orders: {
            total: orders.length,
            by_status: orderStatus,
            by_product_type: orderProductType,
            amount_by_status: sumByStatus(orders, "status", "amount_total", "pending"),
            amount_by_product_type: sumByProductType(orders, "amount_total"),
          },
          earnings: {
            total: mentorEarnings.length,
            by_status: earningStatus,
            net_amount_by_status: sumByStatus(mentorEarnings, "status", "net_amount", "pending"),
            platform_fee_amount: mentorEarnings.reduce(
              (sum, row) => sum + numberValue(row.platform_fee_amount),
              0
            ),
          },
          withdrawals: {
            total: withdrawals.length,
            by_status: withdrawalStatus,
            amount_by_status: sumByStatus(withdrawals, "status", "amount", "requested"),
          },
          refunds: {
            total: refunds.length,
            by_status: refundStatus,
            amount_by_status: sumByStatus(refunds, "status", "amount", "requested"),
          },
          payout_batches: {
            total: payoutBatches.length,
            by_status: payoutBatchStatus,
            amount_by_status: sumByStatus(payoutBatches, "status", "total_amount", "draft"),
          },
        },
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
