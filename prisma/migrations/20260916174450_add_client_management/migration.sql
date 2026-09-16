-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "IndividualTaxpayerType" AS ENUM ('SALARIED_INDIVIDUAL', 'FREELANCER_PROFESSIONAL', 'SOLE_PROPRIETOR', 'OTHER_INDIVIDUAL');

-- CreateEnum
CREATE TYPE "BusinessEntityType" AS ENUM ('PARTNERSHIP_AOP', 'PRIVATE_LIMITED_COMPANY', 'PUBLIC_LIMITED_COMPANY', 'OTHER');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "ClientType" NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "firstName" TEXT,
    "lastName" TEXT,
    "businessName" TEXT,
    "contactPerson" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "ntn" TEXT,
    "taxpayerType" "IndividualTaxpayerType",
    "entityType" "BusinessEntityType",
    "occupation" TEXT,
    "businessActivity" TEXT,
    "taxYear" INTEGER NOT NULL,
    "preparationDeadline" TIMESTAMP(3),
    "sendPortalInvitation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_organizationId_idx" ON "client"("organizationId");

-- CreateIndex
CREATE INDEX "client_organizationId_type_idx" ON "client"("organizationId", "type");

-- CreateIndex
CREATE INDEX "client_organizationId_status_idx" ON "client"("organizationId", "status");

-- CreateIndex
CREATE INDEX "client_email_idx" ON "client"("email");

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
