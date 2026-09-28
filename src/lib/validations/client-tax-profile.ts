import { z } from "zod";

export const filingHistoryStatusValues = [
  "NEW_FILER",
  "EXISTING_FILER",
  "PREVIOUS_RETURN_UNAVAILABLE",
] as const;

export const incomeSourceTypeValues = [
  "SALARY_EMPLOYMENT",
  "FREELANCE_PROFESSIONAL",
  "BUSINESS",
  "RENTAL_PROPERTY",
  "CAPITAL_GAINS",
  "INVESTMENT_PROFIT",
  "AGRICULTURAL",
  "FOREIGN",
  "OTHER",
] as const;

export const assetTypeValues = [
  "BANK_ACCOUNT",
  "CASH_FINANCIAL_ASSETS",
  "IMMOVABLE_PROPERTY",
  "VEHICLE",
  "INVESTMENTS_SECURITIES",
  "BUSINESS_ASSETS",
  "FOREIGN_ASSETS",
  "OTHER_ASSETS",
] as const;

export const taxEvidenceTypeValues = [
  "EMPLOYER_WITHHOLDING",
  "BANK_WITHHOLDING",
  "PROPERTY_TAX_WITHHOLDING",
  "VEHICLE_TAX",
  "BUSINESS_CUSTOMER_WITHHOLDING",
  "ADVANCE_TAX_PAYMENT",
  "OTHER_TAX_DEDUCTED",
] as const;

const optionalMoneySchema = z
  .number()
  .finite()
  .nonnegative("Amount cannot be negative")
  .nullable();

const declaredIncomeAmountSchema = z.object({
  type: z.enum(incomeSourceTypeValues),

  declaredAmount: z
    .number()
    .finite()
    .nonnegative(
      "Declared amount cannot be negative",
    )
    .nullable(),
});

export const clientTaxProfileSchema = z.object({
  filingHistoryStatus: z.enum(
    filingHistoryStatusValues,
  ),

  previousTaxReturnAvailable: z.boolean(),
  previousWealthStatementAvailable: z.boolean(),

  incomeSources: z
    .array(z.enum(incomeSourceTypeValues))
    .default([]),

  declaredIncomeAmounts: z
    .array(declaredIncomeAmountSchema)
    .default([]),

  assetTypes: z
    .array(z.enum(assetTypeValues))
    .default([]),

  taxEvidenceTypes: z
    .array(z.enum(taxEvidenceTypeValues))
    .default([]),

  hasLiabilities: z.boolean(),
  hasMultipleEmployers: z.boolean(),

  openingWealth: optionalMoneySchema,
  wealthAdditions: optionalMoneySchema,
  wealthReductions: optionalMoneySchema,
  closingWealth: optionalMoneySchema,

  internalNotes: z
    .string()
    .trim()
    .max(
      2000,
      "Internal notes cannot exceed 2000 characters",
    ),
});

export type ClientTaxProfileInput = z.infer<
  typeof clientTaxProfileSchema
>;