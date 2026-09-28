-- AlterTable
ALTER TABLE "client_tax_profile" ADD COLUMN     "closingWealth" DECIMAL(18,2),
ADD COLUMN     "openingWealth" DECIMAL(18,2),
ADD COLUMN     "wealthAdditions" DECIMAL(18,2),
ADD COLUMN     "wealthReductions" DECIMAL(18,2);
