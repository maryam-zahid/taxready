/*
  Warnings:

  - Added the required column `responseType` to the `requirement_definition` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RequirementResponseType" AS ENUM ('DOCUMENT', 'INFORMATION', 'DOCUMENT_OR_INFORMATION');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RequirementStatus" ADD VALUE 'NOT_AVAILABLE';
ALTER TYPE "RequirementStatus" ADD VALUE 'WAIVED';

-- AlterTable
ALTER TABLE "client_requirement" ADD COLUMN     "clientNote" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "practitionerNote" TEXT,
ADD COLUMN     "waivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "requirement_definition" ADD COLUMN     "responseType" "RequirementResponseType" NOT NULL;
