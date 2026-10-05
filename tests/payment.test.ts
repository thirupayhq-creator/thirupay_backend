import request from "supertest";
import { app } from "../src/app";

describe("TIRU PAY - Payment API", () => {
  let token: string;
  let paymentId: string;

  const email = `payment_test_${Date.now()}@example.com`;
  const password = "Password123";

  /**
   * ==========================================
   * TEST SETUP
   * ==========================================
   */
  beforeAll(async () => {
    /**
     * Register test merchant
     */
    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Payment Test Merchant",
        email,
        password,
      });

    expect([200, 201]).toContain(
      registerResponse.status
    );

    /**
     * Login
     */
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email,
        password,
      });

    expect(loginResponse.status).toBe(200);

    expect(loginResponse.body.success).toBe(true);

    /**
     * Current API response:
     *
     * data.token
     */
    token = loginResponse.body.data?.token;

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  /**
   * ==========================================
   * CREATE PAYMENT
   * ==========================================
   */
  describe("POST /api/v1/payments", () => {
    it("should create a payment", async () => {
      const orderId = `ORDER_${Date.now()}`;
      const idempotencyKey =
        `payment-test-${Date.now()}`;

      const response = await request(app)
        .post("/api/v1/payments")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .set(
          "Idempotency-Key",
          idempotencyKey
        )
        .send({
          orderId,
          amount: 1000,
          currency: "INR",
          paymentMethod: "UPI",
          description: "Test payment",
        });

      expect([200, 201]).toContain(
        response.status
      );

      expect(response.body.success).toBe(true);

      expect(response.body).toHaveProperty(
        "message"
      );

      expect(response.body).toHaveProperty(
        "data"
      );

      expect(response.body.data).toHaveProperty(
        "id"
      );

      expect(response.body.data).toHaveProperty(
        "orderId",
        orderId
      );

      expect(response.body.data).toHaveProperty(
        "amount"
      );

      expect(response.body.data).toHaveProperty(
        "currency",
        "INR"
      );

      expect(response.body.data).toHaveProperty(
        "status"
      );

      expect(response.body.data).toHaveProperty(
        "provider"
      );

      /**
       * Cashfree payment session is required
       * for frontend checkout.
       */
      expect(
        response.body.data.paymentSessionId
      ).toBeDefined();

      expect(
        typeof response.body.data.paymentSessionId
      ).toBe("string");

      /**
       * Store payment ID for verification test.
       */
      paymentId =
        response.body.data.id;

      expect(paymentId).toBeDefined();
    });

    it("should reject a payment with invalid amount", async () => {
      const response = await request(app)
        .post("/api/v1/payments")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .set(
          "Idempotency-Key",
          `invalid-${Date.now()}`
        )
        .send({
          orderId: `ORDER_${Date.now()}`,
          amount: -100,
          currency: "INR",
        });

      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);

      expect(response.body).toHaveProperty(
        "message"
      );
    });

    it("should reject zero amount", async () => {
      const response = await request(app)
        .post("/api/v1/payments")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .set(
          "Idempotency-Key",
          `zero-${Date.now()}`
        )
        .send({
          orderId: `ORDER_${Date.now()}`,
          amount: 0,
          currency: "INR",
        });

      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
    });

    it("should reject unsupported currency", async () => {
      const response = await request(app)
        .post("/api/v1/payments")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .set(
          "Idempotency-Key",
          `currency-${Date.now()}`
        )
        .send({
          orderId: `ORDER_${Date.now()}`,
          amount: 1000,
          currency: "USD",
        });

      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
    });

    it("should reject missing idempotency key", async () => {
      const response = await request(app)
        .post("/api/v1/payments")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send({
          orderId: `ORDER_${Date.now()}`,
          amount: 1000,
          currency: "INR",
        });

      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
    });

    it("should reject an unauthenticated request", async () => {
      const response = await request(app)
        .post("/api/v1/payments")
        .set(
          "Idempotency-Key",
          `unauth-${Date.now()}`
        )
        .send({
          orderId: `ORDER_${Date.now()}`,
          amount: 1000,
          currency: "INR",
        });

      expect(response.status).toBe(401);

      expect(response.body.success).toBe(false);
    });

    it("should reject an invalid payment method", async () => {
      const response = await request(app)
        .post("/api/v1/payments")
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .set(
          "Idempotency-Key",
          `method-${Date.now()}`
        )
        .send({
          orderId: `ORDER_${Date.now()}`,
          amount: 1000,
          currency: "INR",
          paymentMethod: "INVALID",
        });

      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * ==========================================
   * GET PAYMENT
   * ==========================================
   */
  describe("GET /api/v1/payments/:id", () => {
    it("should get the created payment", async () => {
      if (!paymentId) {
        throw new Error(
          "Payment ID was not created"
        );
      }

      const response = await request(app)
        .get(
          `/api/v1/payments/${paymentId}`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        );

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveProperty(
        "id",
        paymentId
      );

      expect(response.body.data).toHaveProperty(
        "orderId"
      );

      expect(response.body.data).toHaveProperty(
        "status"
      );

      expect(response.body.data).toHaveProperty(
        "provider"
      );
    });

    it("should reject an invalid payment ID", async () => {
      const response = await request(app)
        .get(
          "/api/v1/payments/not-a-valid-uuid"
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        );

      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * ==========================================
   * VERIFY PAYMENT
   * ==========================================
   */
  describe(
    "POST /api/v1/payments/:id/verify",
    () => {
      it("should verify the payment", async () => {
        if (!paymentId) {
          throw new Error(
            "Payment ID was not created"
          );
        }

        const response = await request(app)
          .post(
            `/api/v1/payments/${paymentId}/verify`
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          );

        expect([200, 201]).toContain(
          response.status
        );

        expect(response.body.success).toBe(
          true
        );

        expect(response.body).toHaveProperty(
          "data"
        );

        expect(
          response.body.data
        ).toHaveProperty(
          "id",
          paymentId
        );

        expect(
          response.body.data
        ).toHaveProperty("status");
      });

      it("should reject verification without authentication", async () => {
        if (!paymentId) {
          throw new Error(
            "Payment ID was not created"
          );
        }

        const response = await request(app)
          .post(
            `/api/v1/payments/${paymentId}/verify`
          );

        expect(response.status).toBe(401);

        expect(response.body.success).toBe(
          false
        );
      });
    }
  );

  /**
   * ==========================================
   * INVALID PAYMENT
   * ==========================================
   */
  describe(
    "Invalid Payment Requests",
    () => {
      it("should reject an invalid payment ID", async () => {
        const response = await request(app)
          .post(
            "/api/v1/payments/not-a-valid-uuid/verify"
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          );

        expect(response.status).toBe(400);

        expect(response.body.success).toBe(
          false
        );
      });
    }
  );
});