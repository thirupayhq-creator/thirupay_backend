import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

import prisma from "../config/database";
import { env } from "../config/env";
import { logger } from "../config/logger";

/**
 * Extend Express Request locally so TypeScript
 * knows about the rawBody property created in app.ts.
 */
type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

/**
 * Cashfree Webhook
 *
 * POST /api/v1/webhooks/payment
 *
 * IMPORTANT:
 * Cashfree webhook signature verification requires
 * the ORIGINAL raw request body.
 */
export async function cashfreeWebhook(
  req: RawBodyRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    /**
     * ==========================================
     * 1. READ CASHFREE WEBHOOK HEADERS
     * ==========================================
     */

    const signatureHeader =
      req.headers["x-webhook-signature"];

    const timestampHeader =
      req.headers["x-webhook-timestamp"];

    if (
      !signatureHeader ||
      Array.isArray(signatureHeader) ||
      !timestampHeader ||
      Array.isArray(timestampHeader)
    ) {
      res.status(400).json({
        success: false,
        message:
          "Missing Cashfree webhook signature headers",
      });

      return;
    }

    const signature = String(signatureHeader);
    const timestamp = String(timestampHeader);

    /**
     * ==========================================
     * 2. GET ORIGINAL RAW BODY
     * ==========================================
     *
     * app.ts stores this before express.json()
     * parses the request.
     */

    const rawBody =
      req.rawBody ||
      (Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(
            JSON.stringify(req.body ?? {}),
            "utf8"
          ));

    if (!rawBody || rawBody.length === 0) {
      res.status(400).json({
        success: false,
        message: "Webhook body is empty",
      });

      return;
    }

    /**
     * ==========================================
     * 3. GET CASHFREE WEBHOOK SECRET
     * ==========================================
     */

    const webhookSecret =
      env.CASHFREE_WEBHOOK_SECRET ||
      env.cashfreeWebhookSecret;

    if (!webhookSecret) {
      logger.error(
        "Cashfree webhook secret is not configured"
      );

      res.status(500).json({
        success: false,
        message:
          "Cashfree webhook secret is not configured",
      });

      return;
    }

    /**
     * ==========================================
     * 4. VERIFY HMAC-SHA256 SIGNATURE
     * ==========================================
     *
     * Cashfree signature payload:
     *
     * timestamp + raw request body
     */

    const signaturePayload = Buffer.concat([
      Buffer.from(timestamp, "utf8"),
      rawBody,
    ]);

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        webhookSecret
      )
      .update(signaturePayload)
      .digest("base64");

    const receivedBuffer = Buffer.from(
      signature,
      "utf8"
    );

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );

    /**
     * Timing-safe comparison
     */

    if (
      receivedBuffer.length !==
        expectedBuffer.length ||
      !crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      )
    ) {
      logger.warn(
        "Invalid Cashfree webhook signature"
      );

      res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
      });

      return;
    }

    logger.info(
      "Cashfree webhook signature verified"
    );

    /**
     * ==========================================
     * 5. PARSE WEBHOOK PAYLOAD
     * ==========================================
     */

    let payload: any;

    try {
      payload = JSON.parse(
        rawBody.toString("utf8")
      );
    } catch (error) {
      logger.warn(
        "Invalid Cashfree webhook JSON payload"
      );

      res.status(400).json({
        success: false,
        message: "Invalid webhook payload",
      });

      return;
    }

    /**
     * ==========================================
     * 6. EXTRACT EVENT INFORMATION
     * ==========================================
     */

    const eventType =
      payload?.type ||
      payload?.event ||
      payload?.data?.event_type;

    const cashfreeOrderId =
      payload?.data?.order?.order_id ||
      payload?.data?.order_id ||
      payload?.order?.order_id;

    const cashfreePaymentId =
      payload?.data?.payment?.cf_payment_id ||
      payload?.data?.payment_id ||
      payload?.payment?.cf_payment_id;

    /**
     * Event type is required.
     */

    if (!eventType) {
      logger.warn(
        "Cashfree webhook event type is missing"
      );

      res.status(400).json({
        success: false,
        message: "Webhook event type is missing",
      });

      return;
    }

    /**
     * ==========================================
     * 7. CREATE WEBHOOK EVENT ID
     * ==========================================
     *
     * Cashfree does not use the Razorpay
     * x-razorpay-event-id header.
     *
     * We generate a deterministic ID.
     */

    const eventId = crypto
      .createHash("sha256")
      .update(
        `${timestamp}:${signature}:${eventType}:${cashfreePaymentId || cashfreeOrderId || ""}`
      )
      .digest("hex");

    /**
     * ==========================================
     * 8. CHECK DUPLICATE WEBHOOK
     * ==========================================
     */

    const existingEvent =
      await prisma.webhookEvent.findUnique({
        where: {
          eventId,
        },
      });

    if (existingEvent) {
      logger.info(
        "Cashfree duplicate webhook received",
        {
          eventId,
          eventType,
        }
      );

      res.status(200).json({
        success: true,
        message: "Webhook already processed",
      });

      return;
    }

    /**
     * ==========================================
     * 9. FIND TIRU PAY PAYMENT
     * ==========================================
     */

    let paymentId: string | undefined;

    /**
     * First try Cashfree payment ID.
     */

    if (cashfreePaymentId) {
      const payment =
        await prisma.payment.findFirst({
          where: {
            providerPaymentId:
              String(cashfreePaymentId),
          },
          select: {
            id: true,
          },
        });

      paymentId = payment?.id;
    }

    /**
     * If payment ID wasn't found,
     * search using Cashfree order ID.
     */

    if (!paymentId && cashfreeOrderId) {
      const payment =
        await prisma.payment.findFirst({
          where: {
            cashfreeOrderId:
              String(cashfreeOrderId),
          },
          select: {
            id: true,
          },
        });

      paymentId = payment?.id;
    }

    /**
     * ==========================================
     * 10. STORE WEBHOOK EVENT
     * ==========================================
     */

    const webhookEvent =
      await prisma.webhookEvent.create({
        data: {
          eventId,
          eventType: String(eventType),
          provider: "CASHFREE",
          paymentId: paymentId || null,
          signature,
          payload,
          status: "RECEIVED",
        },
      });

    /**
     * ==========================================
     * 11. PAYMENT SUCCESS
     * ==========================================
     */

    const successEvents = [
      "PAYMENT_SUCCESS_WEBHOOK",
      "PAYMENT_SUCCESS",
      "payment.success",
    ];

    if (
      successEvents.includes(
        String(eventType)
      ) &&
      paymentId
    ) {
      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: "SUCCESS",
          paidAt: new Date(),

          ...(cashfreePaymentId
            ? {
                providerPaymentId:
                  String(cashfreePaymentId),
              }
            : {}),
        },
      });

      logger.info(
        "Cashfree payment marked SUCCESS",
        {
          eventId,
          paymentId,
          cashfreeOrderId,
          cashfreePaymentId,
        }
      );
    }

    /**
     * ==========================================
     * 12. PAYMENT FAILED
     * ==========================================
     */

    const failedEvents = [
      "PAYMENT_FAILED_WEBHOOK",
      "PAYMENT_FAILED",
      "payment.failed",
    ];

    if (
      failedEvents.includes(
        String(eventType)
      ) &&
      paymentId
    ) {
      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: "FAILED",

          ...(cashfreePaymentId
            ? {
                providerPaymentId:
                  String(cashfreePaymentId),
              }
            : {}),
        },
      });

      logger.warn(
        "Cashfree payment marked FAILED",
        {
          eventId,
          paymentId,
          cashfreeOrderId,
          cashfreePaymentId,
        }
      );
    }

    /**
     * ==========================================
     * 13. REFUND
     * ==========================================
     */

    const refundEvents = [
      "REFUND_STATUS_WEBHOOK",
      "REFUND_SUCCESS",
      "refund.success",
    ];

    if (
      refundEvents.includes(
        String(eventType)
      ) &&
      paymentId
    ) {
      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: "REFUNDED",
        },
      });

      logger.info(
        "Cashfree refund webhook processed",
        {
          eventId,
          paymentId,
          cashfreeOrderId,
        }
      );
    }

    /**
     * ==========================================
     * 14. PAYMENT NOT FOUND
     * ==========================================
     *
     * We still acknowledge the webhook so
     * Cashfree does not repeatedly send the
     * same notification.
     */

    if (!paymentId) {
      logger.warn(
        "Cashfree webhook received but TIRU PAY payment was not found",
        {
          eventId,
          eventType,
          cashfreeOrderId,
          cashfreePaymentId,
        }
      );
    }

    /**
     * ==========================================
     * 15. MARK WEBHOOK PROCESSED
     * ==========================================
     */

    await prisma.webhookEvent.update({
      where: {
        id: webhookEvent.id,
      },
      data: {
        status: "PROCESSED",
        processedAt: new Date(),
      },
    });

    /**
     * ==========================================
     * 16. LOG SUCCESS
     * ==========================================
     */

    logger.info(
      "Cashfree webhook processed successfully",
      {
        eventId,
        eventType,
        paymentId,
        cashfreeOrderId,
        cashfreePaymentId,
      }
    );

    /**
     * ==========================================
     * 17. RESPONSE TO CASHFREE
     * ==========================================
     */

    res.status(200).json({
      success: true,
      message:
        "Webhook processed successfully",
    });
  } catch (error) {
    logger.error(
      "Cashfree webhook processing failed",
      error
    );

    next(error);
  }
}