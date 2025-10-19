-- Manual migration to add patient metrics with proper enum handling
-- First, let's check if there are any existing values that conflict

-- Step 1: Add new enum values one by one to avoid conflicts
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'HEIGHT';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'WATER_PERCENTAGE';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'BONE_DENSITY';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'WAIST_CIRCUMFERENCE';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'HIP_CIRCUMFERENCE';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'CHEST_CIRCUMFERENCE';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'ARM_CIRCUMFERENCE';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'THIGH_CIRCUMFERENCE';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'BLOOD_PRESSURE_SYSTOLIC';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'BLOOD_PRESSURE_DIASTOLIC';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'HEART_RATE';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'BLOOD_GLUCOSE';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'CHOLESTEROL';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'TRIGLYCERIDES';

-- Step 2: Create the patient_metrics table
CREATE TABLE IF NOT EXISTS "patient_metrics" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" "MetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_metrics_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS "patient_metrics_patientId_idx" ON "patient_metrics"("patientId");
CREATE INDEX IF NOT EXISTS "patient_metrics_type_idx" ON "patient_metrics"("type");
CREATE INDEX IF NOT EXISTS "patient_metrics_recordedAt_idx" ON "patient_metrics"("recordedAt");

-- Step 4: Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'patient_metrics_patientId_fkey'
    ) THEN
        ALTER TABLE "patient_metrics" ADD CONSTRAINT "patient_metrics_patientId_fkey" 
        FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'patient_metrics_recordedBy_fkey'
    ) THEN
        ALTER TABLE "patient_metrics" ADD CONSTRAINT "patient_metrics_recordedBy_fkey" 
        FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;