-- CreateTable
CREATE TABLE "client_tax_profile" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "hasSalaryIncome" BOOLEAN NOT NULL DEFAULT false,
    "hasFreelanceIncome" BOOLEAN NOT NULL DEFAULT false,
    "hasBusinessIncome" BOOLEAN NOT NULL DEFAULT false,
    "hasRentalIncome" BOOLEAN NOT NULL DEFAULT false,
    "hasInvestmentIncome" BOOLEAN NOT NULL DEFAULT false,
    "hasOtherIncome" BOOLEAN NOT NULL DEFAULT false,
    "hasBankAccounts" BOOLEAN NOT NULL DEFAULT false,
    "hasAssets" BOOLEAN NOT NULL DEFAULT false,
    "hasWithholdingTax" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_tax_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_tax_profile_clientId_key" ON "client_tax_profile"("clientId");

-- CreateIndex
CREATE INDEX "client_tax_profile_clientId_idx" ON "client_tax_profile"("clientId");

-- AddForeignKey
ALTER TABLE "client_tax_profile" ADD CONSTRAINT "client_tax_profile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
