/*
  Warnings:

  - The `severity` column on the `Relapse` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Relapse` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RelapseSeverity" AS ENUM ('low', 'medium', 'high');

-- AlterTable
ALTER TABLE "FAQ" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'tr';

-- AlterTable
ALTER TABLE "Relapse" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mood" TEXT,
ADD COLUMN     "previousStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "time" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "severity",
ADD COLUMN     "severity" "RelapseSeverity" NOT NULL DEFAULT 'medium';

-- CreateIndex
CREATE INDEX "FAQ_language_idx" ON "FAQ"("language");

-- CreateIndex
CREATE INDEX "Relapse_severity_idx" ON "Relapse"("severity");

-- CreateIndex
CREATE INDEX "Relapse_trigger_idx" ON "Relapse"("trigger");

-- CreateIndex
CREATE INDEX "Relapse_createdAt_idx" ON "Relapse"("createdAt");
