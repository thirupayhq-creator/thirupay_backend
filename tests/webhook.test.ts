import request from "supertest";
import crypto from "crypto";
import { app } from "../src/app";

describe("TIRU PAY - Cashfree Webhook API", () => {
  const webhookSecret =
    process.env.CASHFREE_WEBHOOK_SECRET ||
    "tiru-pay-webhook-secret";

  /**
   * Generate Cashfree webhook signature.
   *
   * Cashfree signs:
   *
   * timestamp + raw request body
   *
   * using HMAC-SHA256 and Base64 encoding.
   */
  const createCashfreeSignature = (
    payload: string,
    timestamp: string
  ): string => {
    return crypto
      .createHmac(
        "sha256",
        webhookSecret
      )
      .update(
        timestamp + payload
      )
      .digest("base64");
  };

  describe(
    "POST /api/v1/webhooks/payment",
    () => {
      /**
       * ==========================================
       * INVALID SIGNATURE
       * ==========================================
       */
      it(
        "should reject webhook with invalid signature",
        async () => {
          const timestamp =
            Date.now().toString();

          const payload = JSON.stringify({
            type: "PAYMENT_SUCCESS_WEBHOOK",
            data: {
              order: {
                order_id:
                  `ORDER_${Date.now()}`,
              },
              payment: {
                cf_payment_id:
                  `cf_payment_${Date.now()}`,
                payment_status:
                  "SUCCESS",
              },
            },
          });

          const response =
            await request(app)
              .post(
                "/api/v1/webhooks/payment"
              )
              .set(
                "Content-Type",
                "application/json"
              )
              .set(
                "x-webhook-timestamp",
                timestamp
              )
              .set(
                "x-webhook-signature",
                "invalid-signature"
              )
              .send(payload);

          expect(response.status).toBe(401);

          expect(
            response.body.success
          ).toBe(false);
        }
      );

      /**
       * ==========================================
       * VALID SIGNATURE
       * ==========================================
       */
      it(
        "should accept a valid Cashfree webhook signature",
        async () => {
          const timestamp =
            Date.now().toString();

          const payload = JSON.stringify({
            type: "PAYMENT_SUCCESS_WEBHOOK",
            data: {
              order: {
                order_id:
                  `ORDER_${Date.now()}`,
              },
              payment: {
                cf_payment_id:
                  `cf_payment_${Date.now()}`,
                payment_status:
                  "SUCCESS",
              },
            },
          });

          const signature =
            createCashfreeSignature(
              payload,
              timestamp
            );

          const response =
            await request(app)
              .post(
                "/api/v1/webhooks/payment"
              )
              .set(
                "Content-Type",
                "application/json"
              )
              .set(
                "x-webhook-timestamp",
                timestamp
              )
              .set(
                "x-webhook-signature",
                signature
              )
              .send(payload);

          /**
           * The signature should be accepted.
           *
           * The webhook may subsequently return
           * 200, 400 or 404 depending on whether
           * the referenced payment/order exists.
           *
           * 401 specifically indicates that the
           * signature verification failed.
           */
          expect(response.status).not.toBe(
            401
          );
        }
      );

      /**
       * ==========================================
       * MISSING SIGNATURE
       * ==========================================
       */
      it(
        "should reject webhook without signature",
        async () => {
          const timestamp =
            Date.now().toString();

          const payload = JSON.stringify({
            type: "PAYMENT_SUCCESS_WEBHOOK",
            data: {
              order: {
                order_id:
                  `ORDER_${Date.now()}`,
              },
              payment: {
                cf_payment_id:
                  `cf_payment_${Date.now()}`,
                payment_status:
                  "SUCCESS",
              },
            },
          });

          const response =
            await request(app)
              .post(
                "/api/v1/webhooks/payment"
              )
              .set(
                "Content-Type",
                "application/json"
              )
              .set(
                "x-webhook-timestamp",
                timestamp
              )
              .send(payload);

          expect(response.status).toBe(401);

          expect(
            response.body.success
          ).toBe(false);
        }
      );

      /**
       * ==========================================
       * MISSING TIMESTAMP
       * ==========================================
       */
      it(
        "should reject webhook without timestamp",
        async () => {
          const payload = JSON.stringify({
            type: "PAYMENT_SUCCESS_WEBHOOK",
            data: {
              order: {
                order_id:
                  `ORDER_${Date.now()}`,
              },
              payment: {
                cf_payment_id:
                  `cf_payment_${Date.now()}`,
                payment_status:
                  "SUCCESS",
              },
            },
          });

          const signature =
            crypto
              .createHmac(
                "sha256",
                webhookSecret
              )
              .update(payload)
              .digest("base64");

          const response =
            await request(app)
              .post(
                "/api/v1/webhooks/payment"
              )
              .set(
                "Content-Type",
                "application/json"
              )
              .set(
                "x-webhook-signature",
                signature
              )
              .send(payload);

          expect(response.status).toBe(401);

          expect(
            response.body.success
          ).toBe(false);
        }
      );

      /**
       * ==========================================
       * WRONG SIGNATURE
       * ==========================================
       */
      it(
        "should reject a signature generated with the wrong secret",
        async () => {
          const timestamp =
            Date.now().toString();

          const payload = JSON.stringify({
            type: "PAYMENT_SUCCESS_WEBHOOK",
            data: {
              order: {
                order_id:
                  `ORDER_${Date.now()}`,
              },
              payment: {
                cf_payment_id:
                  `cf_payment_${Date.now()}`,
                payment_status:
                  "SUCCESS",
              },
            },
          });

          const wrongSignature =
            crypto
              .createHmac(
                "sha256",
                "wrong-secret"
              )
              .update(
                timestamp + payload
              )
              .digest("base64");

          const response =
            await request(app)
              .post(
                "/api/v1/webhooks/payment"
              )
              .set(
                "Content-Type",
                "application/json"
              )
              .set(
                "x-webhook-timestamp",
                timestamp
              )
              .set(
                "x-webhook-signature",
                wrongSignature
              )
              .send(payload);

          expect(response.status).toBe(401);

          expect(
            response.body.success
          ).toBe(false);
        }
      );
    }
  );
});