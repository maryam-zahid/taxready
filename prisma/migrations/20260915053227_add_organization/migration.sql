-- CreateEnum
CREATE TYPE "PracticeType" AS ENUM ('TAX_CONSULTANCY', 'ACCOUNTING_FIRM', 'INDEPENDENT_TAX_CONSULTANT', 'CORPORATE_TAX_FINANCE_TEAM', 'OTHER');

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "practiceType" "PracticeType" NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Pakistan',
    "city" TEXT,
    "businessPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organization_member_organizationId_idx" ON "organization_member"("organizationId");

-- CreateIndex
CREATE INDEX "organization_member_userId_idx" ON "organization_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_member_organizationId_userId_key" ON "organization_member"("organizationId", "userId");

-- AddForeignKey
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
