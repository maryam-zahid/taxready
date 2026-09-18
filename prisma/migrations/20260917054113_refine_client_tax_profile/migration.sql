/*
  Warnings:

  - You are about to drop the column `hasAssets` on the `client_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `hasBankAccounts` on the `client_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `hasBusinessIncome` on the `client_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `hasFreelanceIncome` on the `client_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `hasInvestmentIncome` on the `client_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `hasOtherIncome` on the `client_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `hasRentalIncome` on the `client_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `hasSalaryIncome` on the `client_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `hasWithholdingTax` on the `client_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `client_tax_profile` table. All the data in the column will be lost.
  - Added the required column `filingHistoryStatus` to the `client_tax_profile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FilingHistoryStatus" AS ENUM ('NEW_FILER', 'EXISTING_FILER', 'PREVIOUS_RETURN_UNAVAILABLE');

-- CreateEnum
CREATE TYPE "IncomeSourceType" AS ENUM ('SALARY_EMPLOYMENT', 'FREELANCE_PROFESSIONAL', 'BUSINESS', 'RENTAL_PROPERTY', 'CAPITAL_GAINS', 'INVESTMENT_PROFIT', 'AGRICULTURAL', 'FOREIGN', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('BANK_ACCOUNT', 'CASH_FINANCIAL_ASSETS', 'IMMOVABLE_PROPERTY', 'VEHICLE', 'INVESTMENTS_SECURITIES', 'BUSINESS_ASSETS', 'FOREIGN_ASSETS', 'OTHER_ASSETS');

-- CreateEnum
CREATE TYPE "TaxEvidenceType" AS ENUM ('EMPLOYER_WITHHOLDING', 'BANK_WITHHOLDING', 'PROPERTY_TAX_WITHHOLDING', 'VEHICLE_TAX', 'BUSINESS_CUSTOMER_WITHHOLDING', 'ADVANCE_TAX_PAYMENT', 'OTHER_TAX_DEDUCTED');

-- AlterTable
ALTER TABLE "client_tax_profile" DROP COLUMN "hasAssets",
DROP COLUMN "hasBankAccounts",
DROP COLUMN "hasBusinessIncome",
DROP COLUMN "hasFreelanceIncome",
DROP COLUMN "hasInvestmentIncome",
DROP COLUMN "hasOtherIncome",
DROP COLUMN "hasRentalIncome",
DROP COLUMN "hasSalaryIncome",
DROP COLUMN "hasWithholdingTax",
DROP COLUMN "notes",
ADD COLUMN     "filingHistoryStatus" "FilingHistoryStatus" NOT NULL,
ADD COLUMN     "hasLiabilities" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasMultipleEmployers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "previousTaxReturnAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "previousWealthStatementAvailable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "client_income_source" (
    "id" TEXT NOT NULL,
    "taxProfileId" TEXT NOT NULL,
    "type" "IncomeSourceType" NOT NULL,

    CONSTRAINT "client_income_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_asset_type" (
    "id" TEXT NOT NULL,
    "taxProfileId" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,

    CONSTRAINT "client_asset_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_tax_evidence_type" (
    "id" TEXT NOT NULL,
    "taxProfileId" TEXT NOT NULL,
    "type" "TaxEvidenceType" NOT NULL,

    CONSTRAINT "client_tax_evidence_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_income_source_taxProfileId_idx" ON "client_income_source"("taxProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "client_income_source_taxProfileId_type_key" ON "client_income_source"("taxProfileId", "type");

-- CreateIndex
CREATE INDEX "client_asset_type_taxProfileId_idx" ON "client_asset_type"("taxProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "client_asset_type_taxProfileId_type_key" ON "client_asset_type"("taxProfileId", "type");

-- CreateIndex
CREATE INDEX "client_tax_evidence_type_taxProfileId_idx" ON "client_tax_evidence_type"("taxProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "client_tax_evidence_type_taxProfileId_type_key" ON "client_tax_evidence_type"("taxProfileId", "type");

-- AddForeignKey
ALTER TABLE "client_income_source" ADD CONSTRAINT "client_income_source_taxProfileId_fkey" FOREIGN KEY ("taxProfileId") REFERENCES "client_tax_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_asset_type" ADD CONSTRAINT "client_asset_type_taxProfileId_fkey" FOREIGN KEY ("taxProfileId") REFERENCES "client_tax_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_tax_evidence_type" ADD CONSTRAINT "client_tax_evidence_type_taxProfileId_fkey" FOREIGN KEY ("taxProfileId") REFERENCES "client_tax_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
