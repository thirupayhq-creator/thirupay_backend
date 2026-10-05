import { Request, Response, NextFunction } from "express";
import prisma from "../../core/config/database";
import { logger } from "../../core/config/logger";
import { verifyWebhookSignature } from "./cashfree-webhook.verifier";
import { PaymentStatus, RefundStatus } from "@prisma/client";

export async function handleCashfreeWebhook(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const signature = req.headers["x-webhook-signature"] as string | undefined;
  const timestamp = req.headers["x-webhook-timestamp"] as string | undefined;

  // 1. Validate signature headers
  if (!signature || !timestamp) {
    logger.warn("Cashfree webhook rejected: missing signature or timestamp headers");
    res.status(401).json({
      success: false,
      message: "Missing Cashfree webhook signature headers",
    });
    return;
  }

  // 2. Extract raw body for HMAC verification
  const rawBody =
    req.rawBody ||
    (Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body ?? {}), "utf8"));

  if (!rawBody || rawBody.length === 0) {
    res.status(400).json({
      success: false,
      message: "Webhook request body is empty",
    });
    return;
  }

  // 3. Verify HMAC-SHA256 signature
  const isSignatureValid = verifyWebhookSignature(rawBody, signature, timestamp);

  if (!isSignatureValid) {
    logger.error("Cashfree webhook signature verification failed", {
      timestamp,
      signaturePrefix: signature.substring(0, 10),
    });
    res.status(401).json({
      success: false,
      message: "Invalid webhook signature",
    });
    return;
  }

  // 4. Parse payload
  let payload: Record<string, any>;
  try {
    payload = typeof req.body === "object" ? req.body : JSON.parse(rawBody.toString("utf8"));
  } catch (err) {
    res.status(400).json({ success: false, message: "Malformed JSON payload" });
    return;
  }

  const eventType = payload.type || payload.event || "UNKNOWN";
  const eventId =
    payload.event_id ||
    `${eventType}_${payload.data?.order?.order_id || payload.order_id || Date.now()}_${timestamp}`;

  logger.info(`Received Cashfree Webhook [${eventType}]`, { eventId });

  // 5. Check if event was already processed (Idempotency)
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eventId },
  });

  if (existingEvent && existingEvent.status === "PROCESSED") {
    logger.info("Webhook event already processed (idempotent skip)", { eventId });
    res.status(200).json({
      success: true,
      message: "Webhook event already processed",
      data: { eventId, status: "PROCESSED" },
    });
    return;
  }

  try {
    let paymentId: string | undefined;

    // 6. Process Event Types
    switch (eventType) {
      case "PAYMENT_SUCCESS_WEBHOOK": {
        const orderId =
          payload.data?.order?.order_id ||
          payload.data?.order_id ||
          payload.order_id;
        const cfPaymentId =
          payload.data?.payment?.cf_payment_id ||
          payload.data?.cf_payment_id;

        if (orderId) {
          const payment = await prisma.payment.findFirst({
            where: {
              OR: [{ orderId }, { cashfreeOrderId: orderId }],
            },
          });

          if (payment) {
            paymentId = payment.id;
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: "SUCCESS",
                paidAt: new Date(),
                providerPaymentId: cfPaymentId ? String(cfPaymentId) : payment.providerPaymentId,
              },
            });
            logger.info("Payment marked SUCCESS from webhook", { orderId, paymentId });
          }
        }
        break;
      }

      case "PAYMENT_FAILED_WEBHOOK": {
        const orderId =
          payload.data?.order?.order_id ||
          payload.data?.order_id ||
          payload.order_id;

        if (orderId) {
          const payment = await prisma.payment.findFirst({
            where: {
              OR: [{ orderId }, { cashfreeOrderId: orderId }],
            },
          });

          if (payment && payment.status !== "SUCCESS") {
            paymentId = payment.id;
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: "FAILED" },
            });
            logger.info("Payment marked FAILED from webhook", { orderId, paymentId });
          }
        }
        break;
      }

      case "PAYMENT_USER_DROPPED_WEBHOOK": {
        const orderId =
          payload.data?.order?.order_id ||
          payload.data?.order_id ||
          payload.order_id;

        if (orderId) {
          const payment = await prisma.payment.findFirst({
            where: {
              OR: [{ orderId }, { cashfreeOrderId: orderId }],
            },
          });

          if (payment && payment.status === "PENDING") {
            paymentId = payment.id;
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: "CANCELLED" },
            });
            logger.info("Payment marked CANCELLED from user dropped webhook", { orderId });
          }
        }
        break;
      }

      case "REFUND_STATUS_WEBHOOK": {
        const refundId =
          payload.data?.refund?.cf_refund_id ||
          payload.data?.refund?.refund_id ||
          payload.data?.cf_refund_id;
        const refundStatus = payload.data?.refund?.refund_status || payload.data?.refund_status;

        if (refundId && refundStatus) {
          const refund = await prisma.refund.findFirst({
            where: {
              OR: [
                { providerRefundId: String(refundId) },
                { id: String(refundId) },
              ],
            },
          });

          if (refund) {
            let mappedStatus: RefundStatus = refund.status;
            if (refundStatus === "SUCCESS") mappedStatus = "SUCCESS";
            else if (refundStatus === "FAILED") mappedStatus = "FAILED";

            await prisma.refund.update({
              where: { id: refund.id },
              data: {
                status: mappedStatus,
                processedAt: mappedStatus === "SUCCESS" ? new Date() : refund.processedAt,
              },
            });
            logger.info("Refund updated from webhook", { refundId, mappedStatus });
          }
        }
        break;
      }

      default:
        logger.info(`Unhandled webhook event type: ${eventType}`);
        break;
    }

    // 7. Store / Record Webhook Event
    await prisma.webhookEvent.upsert({
      where: { eventId },
      create: {
        eventId,
        eventType,
        provider: "CASHFREE",
        paymentId,
        status: "PROCESSED",
        signature,
        payload,
        processedAt: new Date(),
      },
      update: {
        status: "PROCESSED",
        processedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Cashfree webhook processed successfully",
      data: { eventId, eventType, status: "PROCESSED" },
    });
  } catch (error) {
    logger.error("Failed to process webhook event", error);

    // Record failed attempt
    await prisma.webhookEvent.upsert({
      where: { eventId },
      create: {
        eventId,
        eventType,
        provider: "CASHFREE",
        status: "FAILED",
        signature,
        payload,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      update: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    });

    // Still respond 200 or 500
    res.status(500).json({
      success: false,
      message: "Webhook processing error",
    });
  }
}
