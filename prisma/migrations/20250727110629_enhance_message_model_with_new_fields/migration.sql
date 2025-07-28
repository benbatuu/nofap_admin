/*
  Warnings:

  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessagePriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "category" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "isScheduled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" "MessagePriority" NOT NULL DEFAULT 'medium',
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "SystemMetric" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SystemMetric_metricType_idx" ON "SystemMetric"("metricType");

-- CreateIndex
CREATE INDEX "SystemMetric_status_idx" ON "SystemMetric"("status");

-- CreateIndex
CREATE INDEX "SystemMetric_createdAt_idx" ON "SystemMetric"("createdAt");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_createdAt_idx" ON "UserSession"("createdAt");

-- CreateIndex
CREATE INDEX "Message_category_idx" ON "Message"("category");

-- CreateIndex
CREATE INDEX "Message_priority_idx" ON "Message"("priority");

-- CreateIndex
CREATE INDEX "Message_isScheduled_idx" ON "Message"("isScheduled");

-- CreateIndex
CREATE INDEX "Message_scheduledAt_idx" ON "Message"("scheduledAt");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
