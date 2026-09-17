-- CreateEnum
CREATE TYPE "RequirementCategory" AS ENUM ('PRIOR_FILING', 'INCOME', 'BANKING', 'ASSETS', 'TAX_WITHHOLDING', 'LIABILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('PENDING', 'REQUESTED', 'SUBMITTED', 'NEEDS_REVIEW', 'COMPLETED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "RequirementSource" AS ENUM ('PROFILE_RULE', 'MANUAL');

-- CreateTable
CREATE TABLE "requirement_definition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "RequirementCategory" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirement_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_requirement" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "requirementDefinitionId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "status" "RequirementStatus" NOT NULL DEFAULT 'PENDING',
    "source" "RequirementSource" NOT NULL DEFAULT 'PROFILE_RULE',
    "required" BOOLEAN NOT NULL DEFAULT true,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_requirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "requirement_definition_code_key" ON "requirement_definition"("code");

-- CreateIndex
CREATE INDEX "requirement_definition_category_idx" ON "requirement_definition"("category");

-- CreateIndex
CREATE INDEX "requirement_definition_active_idx" ON "requirement_definition"("active");

-- CreateIndex
CREATE INDEX "client_requirement_clientId_idx" ON "client_requirement"("clientId");

-- CreateIndex
CREATE INDEX "client_requirement_clientId_taxYear_idx" ON "client_requirement"("clientId", "taxYear");

-- CreateIndex
CREATE INDEX "client_requirement_status_idx" ON "client_requirement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "client_requirement_clientId_requirementDefinitionId_taxYear_key" ON "client_requirement"("clientId", "requirementDefinitionId", "taxYear");

-- AddForeignKey
ALTER TABLE "client_requirement" ADD CONSTRAINT "client_requirement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_requirement" ADD CONSTRAINT "client_requirement_requirementDefinitionId_fkey" FOREIGN KEY ("requirementDefinitionId") REFERENCES "requirement_definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
