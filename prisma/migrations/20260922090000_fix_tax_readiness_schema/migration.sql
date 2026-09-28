-- Restore the declared income amount column that was
-- incorrectly removed by the previous readiness migration.
ALTER TABLE "client_income_source"
ADD COLUMN IF NOT EXISTS "declaredAmount" DECIMAL(18,2);

-- Create the readiness enum if it does not already exist.
DO $$
BEGIN
    CREATE TYPE "TaxReadinessStatus" AS ENUM (
        'IN_PROGRESS',
        'BLOCKED',
        'READY_FOR_REVIEW',
        'TAX_READY'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- Add TaxReady readiness state to Client.
ALTER TABLE "client"
ADD COLUMN IF NOT EXISTS "taxReadinessStatus"
    "TaxReadinessStatus" NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN IF NOT EXISTS "taxReadyAt"
    TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "taxReadyByUserId"
    TEXT;