/*
  Warnings:

  - The values [WAIST,HIP,CUSTOM] on the enum `MetricType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MetricType_new" AS ENUM ('WEIGHT', 'HEIGHT', 'BMI', 'BODY_FAT', 'MUSCLE_MASS', 'WATER_PERCENTAGE', 'BONE_DENSITY', 'WAIST_CIRCUMFERENCE', 'HIP_CIRCUMFERENCE', 'CHEST_CIRCUMFERENCE', 'ARM_CIRCUMFERENCE', 'THIGH_CIRCUMFERENCE', 'BLOOD_PRESSURE_SYSTOLIC', 'BLOOD_PRESSURE_DIASTOLIC', 'HEART_RATE', 'BLOOD_GLUCOSE', 'CHOLESTEROL', 'TRIGLYCERIDES');
ALTER TABLE "patient_metrics" ALTER COLUMN "type" TYPE "MetricType_new" USING ("type"::text::"MetricType_new");
ALTER TABLE "progress_metrics" ALTER COLUMN "type" TYPE "MetricType_new" USING ("type"::text::"MetricType_new");
ALTER TYPE "MetricType" RENAME TO "MetricType_old";
ALTER TYPE "MetricType_new" RENAME TO "MetricType";
DROP TYPE "MetricType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "plans" DROP CONSTRAINT "plans_patientId_fkey";

-- DropForeignKey
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_createdBy_fkey";

-- AlterTable
ALTER TABLE "plans" ALTER COLUMN "patientId" DROP NOT NULL,
ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
