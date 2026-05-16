import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as createCheckout } from "@/app/api/v1/payments/checkout/route";
import { POST as stripeWebhook } from "@/app/api/v1/payments/stripe/webhook/route";
import { GET as getOrders } from "@/app/api/v1/orders/route";

const mocked = vi.hoisted(() => ({
  getUserFromBearer: vi.fn(),
  createServiceClient: vi.fn(),
  ordersInsert: vi.fn(),
  ordersUpdate: vi.fn(),
  stripeCheckoutCreate: vi.fn(),
  stripeConstructEvent: vi.fn(),
}));

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: (...args: unknown[]) => mocked.getUserFromBearer(...args),
}));

vi.mock("@/lib/api/supabase-service", () => ({
  createServiceClient: () => mocked.createServiceClient(),
}));

vi.mock("stripe", () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: (...args: unknown[]) => mocked.stripeCheckoutCreate(...args),
      },
    },
    webhooks: {
      constructEvent: (...args: unknown[]) => mocked.stripeConstructEvent(...args),
    },
  })),
}));

describe("payments checkout", () => {
  beforeEach(() => {
    mocked.getUserFromBearer.mockReset();
    mocked.createServiceClient.mockReset();
    mocked.ordersInsert.mockReset();
    mocked.ordersUpdate.mockReset();
    mocked.stripeCheckoutCreate.mockReset();
    delete process.env.STRIPE_SECRET_KEY;
  });

  it("requires login", async () => {
    mocked.getUserFromBearer.mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/v1/payments/checkout", {
      method: "POST",
      body: JSON.stringify({ amountTotal: 9900 }),
    });
    const res = await createCheckout(req);

    expect(res.status).toBe(401);
  });

  it("reports missing Stripe config after auth", async () => {
    mocked.getUserFromBearer.mockResolvedValue({ id: "user-1", email: "dev.test@artsee.app" });

    const req = new NextRequest("http://localhost/api/v1/payments/checkout", {
      method: "POST",
      body: JSON.stringify({ subject: "咨询服务", amountTotal: 9900, currency: "cny" }),
    });
    const res = await createCheckout(req);
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toContain("STRIPE_SECRET_KEY");
  });

  it("creates Stripe Checkout session and updates order", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_artsee";
    mocked.getUserFromBearer.mockResolvedValue({ id: "user-1", email: "dev.test@artsee.app" });
    mocked.ordersInsert.mockReturnValue({
      select: () => ({
        single: async () => ({ data: { id: "order-1" }, error: null }),
      }),
    });
    mocked.ordersUpdate.mockReturnValue({
      eq: async () => ({ error: null }),
    });
    mocked.createServiceClient.mockReturnValue({
      from: (table: string) => {
        expect(table).toBe("orders");
        return {
          insert: (...args: unknown[]) => mocked.ordersInsert(...args),
          update: (...args: unknown[]) => mocked.ordersUpdate(...args),
        };
      },
    });
    mocked.stripeCheckoutCreate.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.test/session",
      customer: "cus_123",
    });

    const req = new NextRequest("http://localhost/api/v1/payments/checkout", {
      method: "POST",
      body: JSON.stringify({
        subject: "作品集辅导",
        amountTotal: 299900,
        currency: "cny",
        itemType: "course",
        itemId: "course0",
      }),
    });
    const res = await createCheckout(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.sessionId).toBe("cs_test_123");
    expect(body.data.checkoutUrl).toBe("https://checkout.stripe.test/session");
    expect(mocked.ordersInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        subject: "作品集辅导",
        amount_total: 299900,
        currency: "cny",
        item_type: "course",
      })
    );
    expect(mocked.stripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        client_reference_id: "order-1",
        customer_email: "dev.test@artsee.app",
      })
    );
    expect(mocked.ordersUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "checkout_created",
        provider_checkout_session_id: "cs_test_123",
        provider_customer_id: "cus_123",
      })
    );
  });
});

describe("stripe webhook", () => {
  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("reports missing webhook config", async () => {
    const req = new NextRequest("http://localhost/api/v1/payments/stripe/webhook", {
      method: "POST",
      body: "{}",
    });
    const res = await stripeWebhook(req);

    expect(res.status).toBe(503);
  });
});

describe("orders", () => {
  beforeEach(() => {
    mocked.getUserFromBearer.mockReset();
  });

  it("requires login for order list", async () => {
    mocked.getUserFromBearer.mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/v1/orders");
    const res = await getOrders(req);

    expect(res.status).toBe(401);
  });
});
