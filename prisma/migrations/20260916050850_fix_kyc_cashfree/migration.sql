-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MERCHANT');

-- CreateEnum
CREATE TYPE "MerchantStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'CARD', 'NET_BANKING', 'WALLET', 'OTHER');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('CREATED', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('CREATED', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MERCHANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT,
    "phone" TEXT,
    "status" "MerchantStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "paymentMethod" "PaymentMethod",
    "provider" TEXT,
    "providerPaymentId" TEXT,
    "providerOrderId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "RefundStatus" NOT NULL DEFAULT 'CREATED',
    "provider" TEXT,
    "providerRefundId" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "beneficiaryId" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'CREATED',
    "provider" TEXT,
    "providerPayoutId" TEXT,
    "failureReason" TEXT,
    "metadata" JSONB,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "paymentId" TEXT,
    "status" "WebhookStatus" NOT NULL DEFAULT 'RECEIVED',
    "signature" TEXT,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestHash" TEXT,
    "responseStatus" INTEGER,
    "responseBody" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycVerification" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "providerReference" TEXT,
    "submittedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_userId_key" ON "Merchant"("userId");

-- CreateIndex
CREATE INDEX "Merchant_status_idx" ON "Merchant"("status");

-- CreateIndex
CREATE INDEX "Payment_merchantId_idx" ON "Payment"("merchantId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_providerPaymentId_idx" ON "Payment"("providerPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_merchantId_orderId_key" ON "Payment"("merchantId", "orderId");

-- CreateIndex
CREATE INDEX "Refund_paymentId_idx" ON "Refund"("paymentId");

-- CreateIndex
CREATE INDEX "Refund_merchantId_idx" ON "Refund"("merchantId");

-- CreateIndex
CREATE INDEX "Refund_providerRefundId_idx" ON "Refund"("providerRefundId");

-- CreateIndex
CREATE INDEX "Refund_status_idx" ON "Refund"("status");

-- CreateIndex
CREATE INDEX "Payout_createdAt_idx" ON "Payout"("createdAt");

-- CreateIndex
CREATE INDEX "Payout_merchantId_idx" ON "Payout"("merchantId");

-- CreateIndex
CREATE INDEX "Payout_providerPayoutId_idx" ON "Payout"("providerPayoutId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_eventId_key" ON "WebhookEvent"("eventId");

-- CreateIndex
CREATE INDEX "WebhookEvent_createdAt_idx" ON "WebhookEvent"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventType_idx" ON "WebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "WebhookEvent_paymentId_idx" ON "WebhookEvent"("paymentId");

-- CreateIndex
CREATE INDEX "WebhookEvent_provider_idx" ON "WebhookEvent"("provider");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_idx" ON "WebhookEvent"("status");

-- CreateIndex
CREATE INDEX "IdempotencyKey_expiresAt_idx" ON "IdempotencyKey"("expiresAt");

-- CreateIndex
CREATE INDEX "IdempotencyKey_merchantId_idx" ON "IdempotencyKey"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_merchantId_key_endpoint_key" ON "IdempotencyKey"("merchantId", "key", "endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "KycVerification_merchantId_key" ON "KycVerification"("merchantId");

-- CreateIndex
CREATE INDEX "KycVerification_status_idx" ON "KycVerification"("status");

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyKey" ADD CONSTRAINT "IdempotencyKey_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycVerification" ADD CONSTRAINT "KycVerification_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
