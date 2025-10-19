/*
  Warnings:

  - You are about to drop the column `userId` on the `plans` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "plans" DROP CONSTRAINT "plans_userId_fkey";

-- AlterTable
ALTER TABLE "plan_days" ADD COLUMN     "date" TIMESTAMP(3),
ALTER COLUMN "dayOfWeek" DROP NOT NULL;

-- AlterTable
ALTER TABLE "plan_meals" ADD COLUMN     "carbsGr" INTEGER,
ADD COLUMN     "fatGr" INTEGER,
ADD COLUMN     "kcal" INTEGER,
ADD COLUMN     "proteinGr" INTEGER,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ALTER COLUMN "time" DROP NOT NULL;

-- AlterTable
ALTER TABLE "plans" DROP COLUMN "userId",
ADD COLUMN     "carbsGr" INTEGER,
ADD COLUMN     "fatGr" INTEGER,
ADD COLUMN     "frequencyPerDay" INTEGER,
ADD COLUMN     "kcalPerDay" INTEGER,
ADD COLUMN     "preferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "proteinGr" INTEGER,
ADD COLUMN     "restrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "goals" SET DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "plan_versions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "modelId" TEXT,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_versions_planId_version_idx" ON "plan_versions"("planId", "version");

-- CreateIndex
CREATE INDEX "audit_logs_model_modelId_idx" ON "audit_logs"("model", "modelId");

-- CreateIndex
CREATE INDEX "plan_days_planId_idx" ON "plan_days"("planId");

-- CreateIndex
CREATE INDEX "plan_days_date_idx" ON "plan_days"("date");

-- CreateIndex
CREATE INDEX "plan_meals_planDayId_idx" ON "plan_meals"("planDayId");

-- CreateIndex
CREATE INDEX "plans_patientId_idx" ON "plans"("patientId");

-- CreateIndex
CREATE INDEX "plans_nutritionistId_idx" ON "plans"("nutritionistId");

-- CreateIndex
CREATE INDEX "plans_createdAt_idx" ON "plans"("createdAt");

-- AddForeignKey
ALTER TABLE "plan_versions" ADD CONSTRAINT "plan_versions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_versions" ADD CONSTRAINT "plan_versions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
