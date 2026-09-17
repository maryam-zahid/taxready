import type {
  AssetType,
  FilingHistoryStatus,
  IncomeSourceType,
  TaxEvidenceType,
} from "@/generated/prisma/client";

export type ComplianceProfileSnapshot = {
  filingHistoryStatus: FilingHistoryStatus;
  previousTaxReturnAvailable: boolean;
  previousWealthStatementAvailable: boolean;

  incomeSources: IncomeSourceType[];
  assetTypes: AssetType[];
  taxEvidenceTypes: TaxEvidenceType[];

  hasLiabilities: boolean;
  hasMultipleEmployers: boolean;
};

export function evaluateComplianceRules(
  profile: ComplianceProfileSnapshot
): string[] {
  const requirements = new Set<string>();

  // --------------------------------------------------
  // PRIOR FILING
  // --------------------------------------------------

  if (profile.filingHistoryStatus === "EXISTING_FILER") {
    if (profile.previousTaxReturnAvailable) {
      requirements.add("PREVIOUS_TAX_RETURN");
    }

    if (profile.previousWealthStatementAvailable) {
      requirements.add("PREVIOUS_WEALTH_STATEMENT");
    }
  }

  // --------------------------------------------------
  // INCOME
  // --------------------------------------------------

  for (const incomeSource of profile.incomeSources) {
    switch (incomeSource) {
      case "SALARY_EMPLOYMENT":
        requirements.add("SALARY_CERTIFICATE");
        requirements.add(
          "EMPLOYMENT_INCOME_INFORMATION"
        );
        break;

      case "FREELANCE_PROFESSIONAL":
        requirements.add(
          "FREELANCE_INCOME_INFORMATION"
        );
        requirements.add(
          "FREELANCE_INCOME_EVIDENCE"
        );
        break;

      case "BUSINESS":
        requirements.add(
          "BUSINESS_INCOME_INFORMATION"
        );
        requirements.add(
          "BUSINESS_EXPENSE_INFORMATION"
        );
        requirements.add(
          "BUSINESS_SUPPORTING_RECORDS"
        );
        break;

      case "RENTAL_PROPERTY":
        requirements.add(
          "RENTAL_INCOME_INFORMATION"
        );
        requirements.add(
          "RENTAL_SUPPORTING_EVIDENCE"
        );
        break;

      case "CAPITAL_GAINS":
        requirements.add(
          "CAPITAL_GAIN_INFORMATION"
        );
        requirements.add(
          "CAPITAL_GAIN_EVIDENCE"
        );
        break;

      case "INVESTMENT_PROFIT":
        requirements.add(
          "INVESTMENT_INCOME_INFORMATION"
        );
        requirements.add(
          "INVESTMENT_INCOME_EVIDENCE"
        );
        break;

      case "AGRICULTURAL":
        requirements.add(
          "AGRICULTURAL_INCOME_INFORMATION"
        );
        break;

      case "FOREIGN":
        requirements.add(
          "FOREIGN_INCOME_INFORMATION"
        );
        requirements.add(
          "FOREIGN_INCOME_EVIDENCE"
        );
        break;

      case "OTHER":
        requirements.add(
          "OTHER_INCOME_INFORMATION"
        );
        break;
    }
  }

  // --------------------------------------------------
  // ASSETS / WEALTH
  // --------------------------------------------------

  for (const assetType of profile.assetTypes) {
    switch (assetType) {
      case "BANK_ACCOUNT":
        requirements.add(
          "BANK_ACCOUNT_INFORMATION"
        );
        requirements.add("BANK_STATEMENT");
        break;

      case "CASH_FINANCIAL_ASSETS":
        requirements.add(
          "CASH_FINANCIAL_ASSET_INFORMATION"
        );
        break;

      case "IMMOVABLE_PROPERTY":
        requirements.add(
          "PROPERTY_INFORMATION"
        );
        break;

      case "VEHICLE":
        requirements.add(
          "VEHICLE_INFORMATION"
        );
        break;

      case "INVESTMENTS_SECURITIES":
        requirements.add(
          "INVESTMENT_ASSET_INFORMATION"
        );
        break;

      case "BUSINESS_ASSETS":
        requirements.add(
          "BUSINESS_ASSET_INFORMATION"
        );
        break;

      case "FOREIGN_ASSETS":
        requirements.add(
          "FOREIGN_ASSET_INFORMATION"
        );
        break;

      case "OTHER_ASSETS":
        requirements.add(
          "OTHER_ASSET_INFORMATION"
        );
        break;
    }
  }

  // --------------------------------------------------
  // LIABILITIES
  // --------------------------------------------------

  if (profile.hasLiabilities) {
    requirements.add("LIABILITY_INFORMATION");
    requirements.add("LIABILITY_EVIDENCE");
  }

  // --------------------------------------------------
  // TAX / WITHHOLDING
  // --------------------------------------------------

  for (
    const evidenceType of profile.taxEvidenceTypes
  ) {
    switch (evidenceType) {
      case "EMPLOYER_WITHHOLDING":
        requirements.add(
          "EMPLOYER_WITHHOLDING_EVIDENCE"
        );
        break;

      case "BANK_WITHHOLDING":
        requirements.add(
          "BANK_WITHHOLDING_EVIDENCE"
        );
        break;

      case "PROPERTY_TAX_WITHHOLDING":
        requirements.add(
          "PROPERTY_TAX_WITHHOLDING_EVIDENCE"
        );
        break;

      case "VEHICLE_TAX":
        requirements.add(
          "VEHICLE_TAX_EVIDENCE"
        );
        break;

      case "BUSINESS_CUSTOMER_WITHHOLDING":
        requirements.add(
          "BUSINESS_WITHHOLDING_EVIDENCE"
        );
        break;

      case "ADVANCE_TAX_PAYMENT":
        requirements.add(
          "ADVANCE_TAX_PAYMENT_EVIDENCE"
        );
        break;

      case "OTHER_TAX_DEDUCTED":
        requirements.add(
          "OTHER_TAX_DEDUCTED_EVIDENCE"
        );
        break;
    }
  }

  /*
   * Multiple employers is contextual information.
   *
   * We deliberately do not create duplicate requirement
   * definitions here. Later, the request/information layer
   * can collect employer-specific details while keeping the
   * compliance checklist clean.
   */
  if (
    profile.hasMultipleEmployers &&
    profile.incomeSources.includes(
      "SALARY_EMPLOYMENT"
    )
  ) {
    requirements.add("SALARY_CERTIFICATE");
    requirements.add(
      "EMPLOYMENT_INCOME_INFORMATION"
    );
  }

  return Array.from(requirements);
}