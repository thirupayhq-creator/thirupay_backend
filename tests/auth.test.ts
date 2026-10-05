import request from "supertest";
import { app } from "../src/app";

describe("TIRU PAY - Authentication API", () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "Password123";

  describe("POST /api/v1/auth/register", () => {
    it("should register a new merchant", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Test Merchant",
          email: testEmail,
          password: testPassword,
        });

      expect([200, 201]).toContain(
        response.status
      );

      expect(response.body).toMatchObject({
        success: true,
      });

      expect(response.body).toHaveProperty(
        "message"
      );

      expect(response.body).toHaveProperty(
        "data"
      );

      expect(response.body.data).toHaveProperty(
        "user"
      );

      expect(response.body.data.user).toHaveProperty(
        "id"
      );

      expect(response.body.data.user).toHaveProperty(
        "email",
        testEmail
      );

      expect(response.body.data.user).toHaveProperty(
        "role",
        "MERCHANT"
      );

      expect(response.body.data).toHaveProperty(
        "merchant"
      );

      expect(response.body.data.merchant).toHaveProperty(
        "id"
      );

      expect(response.body.data).toHaveProperty(
        "token"
      );

      expect(
        typeof response.body.data.token
      ).toBe("string");
    });

    it("should reject invalid registration data", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "A",
          email: "invalid-email",
          password: "123",
        });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
      });

      expect(response.body).toHaveProperty(
        "message"
      );
    });

    it("should reject duplicate email registration", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Another Merchant",
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
      });

      expect(response.body.message).toMatch(
        /already registered/i
      );
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        success: true,
      });

      expect(response.body).toHaveProperty(
        "data"
      );

      expect(response.body.data).toHaveProperty(
        "token"
      );

      expect(
        typeof response.body.data.token
      ).toBe("string");

      expect(
        response.body.data.token.length
      ).toBeGreaterThan(20);

      expect(response.body.data).toHaveProperty(
        "user"
      );

      expect(response.body.data.user).toHaveProperty(
        "email",
        testEmail
      );

      expect(response.body.data.user).toHaveProperty(
        "role",
        "MERCHANT"
      );
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword123",
        });

      expect(response.status).toBe(401);

      expect(response.body).toMatchObject({
        success: false,
      });
    });

    it("should reject login with an unknown email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: `unknown_${Date.now()}@example.com`,
          password: testPassword,
        });

      expect(response.status).toBe(401);

      expect(response.body).toMatchObject({
        success: false,
      });
    });

    it("should reject invalid login data", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "invalid-email",
          password: "",
        });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
      });
    });
  });
});