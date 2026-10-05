-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cashfreeOrderId" TEXT,
ADD COLUMN     "paymentSessionId" TEXT;

-- CreateIndex
CREATE INDEX "Payment_cashfreeOrderId_idx" ON "Payment"("cashfreeOrderId");
