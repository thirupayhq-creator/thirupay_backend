import request from "supertest";
import { app } from "../src/app";

describe("TIRU PAY - Refund API", () => {
  let token: string;
  let paymentId: string;

  const email = `refund_test_${Date.now()}@example.com`;
  const password = "Password123";

  /**
   * ==========================================
   * TEST SETUP
   * ==========================================
   */
  beforeAll(async () => {
    /**
     * ------------------------------------------
     * 1. REGISTER MERCHANT
     * ------------------------------------------
     */
    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Refund Test Merchant",
        email,
        password,
      });

    expect([200, 201]).toContain(
      registerResponse.status
    );

    expect(
      registerResponse.body.success
    ).toBe(true);

    /**
     * ------------------------------------------
     * 2. LOGIN
     * ------------------------------------------
     */
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email,
        password,
      });

    expect(loginResponse.status).toBe(200);

    expect(
      loginResponse.body.success
    ).toBe(true);

    token = loginResponse.body.data?.token;

    expect(token).toBeDefined();

    /**
     * ------------------------------------------
     * 3. ONBOARD MERCHANT
     * ------------------------------------------
     */
    const merchantResponse =
      await request(app)
        .post("/api/v1/merchants/onboard")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send({
          businessName:
            "Refund Test Business",
          businessType: "SOFTWARE",
          phone: "9876543210",
        });

    expect([200, 201]).toContain(
      merchantResponse.status
    );

    /**
     * ------------------------------------------
     * 4. SUBMIT KYC
     * ------------------------------------------
     */
    const kycResponse =
      await request(app)
        .post("/api/v1/kyc/submit")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send({
          provider: "MOCK_KYC",
          providerReference:
            `KYC_${Date.now()}`,
        });

    expect([200, 201]).toContain(
      kycResponse.status
    );

    /**
     * ------------------------------------------
     * 5. VERIFY KYC
     * ------------------------------------------
     *
     * This endpoint is normally an admin/provider
     * operation in a production system.
     *
     * If your current application does not expose
     * a public KYC verification endpoint, this
     * step should instead be performed directly
     * through your test database/fixture.
     */
    const merchantProfile =
      await request(app)
        .get("/api/v1/merchants/profile")
        .set(
          "Authorization",
          `Bearer ${token}`
        );

    expect(merchantProfile.status).toBe(200);

    const merchantStatus =
      merchantProfile.body.data?.status;

    /**
     * ------------------------------------------
     * 6. CREATE PAYMENT
     * ------------------------------------------
     *
     * Payment creation requires ACTIVE merchant.
     *
     * If the merchant is not ACTIVE because KYC
     * verification is not exposed as a test route,
     * the payment creation test will be skipped
     * with a clear error instead of silently passing.
     */
    if (merchantStatus !== "ACTIVE") {
      throw new Error(
        "Test merchant is not ACTIVE. Complete KYC verification or use a test database fixture before running refund integration tests."
      );
    }

    const paymentResponse =
      await request(app)
        .post("/api/v1/payments")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .set(
          "Idempotency-Key",
          `refund-payment-${Date.now()}`
        )
        .send({
          orderId:
            `REFUND_ORDER_${Date.now()}`,
          amount: 1000,
          currency: "INR",
          paymentMethod: "UPI",
          description:
            "Refund integration test payment",
        });

    expect([200, 201]).toContain(
      paymentResponse.status
    );

    expect(
      paymentResponse.body.success
    ).toBe(true);

    paymentId =
      paymentResponse.body.data?.id;

    expect(paymentId).toBeDefined();

    /**
     * ------------------------------------------
     * 7. VERIFY PAYMENT
     * ------------------------------------------
     */
    const verifyResponse =
      await request(app)
        .post(
          `/api/v1/payments/${paymentId}/verify`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        );

    expect([200, 201]).toContain(
      verifyResponse.status
    );

    expect(
      verifyResponse.body.success
    ).toBe(true);
  });

  /**
   * ==========================================
   * CREATE REFUND
   * ==========================================
   */
  describe(
    "POST /api/v1/payments/:id/refund",
    () => {
      it("should create a refund", async () => {
        expect(paymentId).toBeDefined();

        const response =
          await request(app)
            .post(
              `/api/v1/payments/${paymentId}/refund`
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              amount: 500,
              reason:
                "Customer requested refund",
            });

        expect([200, 201]).toContain(
          response.status
        );

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body
        ).toHaveProperty("message");

        expect(
          response.body
        ).toHaveProperty("data");

        expect(
          response.body.data
        ).toHaveProperty("id");

        expect(
          response.body.data
        ).toHaveProperty(
          "paymentId",
          paymentId
        );

        expect(
          Number(response.body.data.amount)
        ).toBe(500);

        expect(
          response.body.data
        ).toHaveProperty(
          "status"
        );

        expect(
          response.body.data
        ).toHaveProperty(
          "provider"
        );

        expect(
          response.body.data
        ).toHaveProperty(
          "providerRefundId"
        );
      });

      it("should reject a negative refund amount", async () => {
        const response =
          await request(app)
            .post(
              `/api/v1/payments/${paymentId}/refund`
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              amount: -100,
              reason:
                "Invalid refund",
            });

        expect(response.status).toBe(400);

        expect(
          response.body.success
        ).toBe(false);
      });

      it("should reject a zero refund amount", async () => {
        const response =
          await request(app)
            .post(
              `/api/v1/payments/${paymentId}/refund`
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              amount: 0,
              reason:
                "Invalid refund",
            });

        expect(response.status).toBe(400);

        expect(
          response.body.success
        ).toBe(false);
      });

      it("should reject a refund with more than two decimal places", async () => {
        const response =
          await request(app)
            .post(
              `/api/v1/payments/${paymentId}/refund`
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              amount: 100.123,
              reason:
                "Invalid decimal amount",
            });

        expect(response.status).toBe(400);

        expect(
          response.body.success
        ).toBe(false);
      });

      it("should reject a refund greater than the refundable amount", async () => {
        const response =
          await request(app)
            .post(
              `/api/v1/payments/${paymentId}/refund`
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              amount: 600,
              reason:
                "Exceeds refundable amount",
            });

        expect(response.status).toBe(400);

        expect(
          response.body.success
        ).toBe(false);
      });

      it("should reject an unauthenticated refund request", async () => {
        const response =
          await request(app)
            .post(
              `/api/v1/payments/${paymentId}/refund`
            )
            .send({
              amount: 100,
              reason:
                "Unauthorized refund",
            });

        expect(response.status).toBe(401);

        expect(
          response.body.success
        ).toBe(false);
      });

      it("should reject an invalid payment ID", async () => {
        const response =
          await request(app)
            .post(
              "/api/v1/payments/not-a-valid-uuid/refund"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              amount: 100,
            });

        expect(response.status).toBe(400);

        expect(
          response.body.success
        ).toBe(false);
      });

      it("should reject a missing refund amount", async () => {
        const response =
          await request(app)
            .post(
              `/api/v1/payments/${paymentId}/refund`
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              reason:
                "Missing amount",
            });

        expect(response.status).toBe(400);

        expect(
          response.body.success
        ).toBe(false);
      });
    }
  );

  /**
   * ==========================================
   * GET REFUNDS
   * ==========================================
   *
   * Add these tests when your refund routes expose
   * GET endpoints for refund history.
   */
  describe("Refund validation", () => {
    it("should reject an unauthenticated request", async () => {
      const response =
        await request(app)
          .post(
            `/api/v1/payments/${paymentId}/refund`
          )
          .send({
            amount: 100,
          });

      expect(response.status).toBe(401);

      expect(
        response.body.success
      ).toBe(false);
    });
  });
});