/*
  Warnings:

  - The values [TAX_CONSULTANCY,ACCOUNTING_FIRM,INDEPENDENT_TAX_CONSULTANT,CORPORATE_TAX_FINANCE_TEAM] on the enum `PracticeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PracticeType_new" AS ENUM ('INDEPENDENT_TAX_PROFESSIONAL', 'TAX_ACCOUNTING_FIRM', 'OTHER');
ALTER TABLE "organization" ALTER COLUMN "practiceType" TYPE "PracticeType_new" USING ("practiceType"::text::"PracticeType_new");
ALTER TYPE "PracticeType" RENAME TO "PracticeType_old";
ALTER TYPE "PracticeType_new" RENAME TO "PracticeType";
DROP TYPE "public"."PracticeType_old";
COMMIT;

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "address" TEXT,
ADD COLUMN     "businessEmail" TEXT,
ADD COLUMN     "ntn" TEXT,
ADD COLUMN     "website" TEXT;
