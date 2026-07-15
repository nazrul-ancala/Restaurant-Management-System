-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "refund_reason" TEXT,
ADD COLUMN     "refunded_at" TIMESTAMP(3);
