import type {
  RequirementCategory,
  RequirementResponseType,
} from "@/generated/prisma/client";

export type RequirementDefinitionSeed = {
  code: string;
  title: string;
  description: string;
  category: RequirementCategory;
  responseType: RequirementResponseType;
};

export const requirementCatalog: RequirementDefinitionSeed[] = [
  // --------------------------------------------------
  // PRIOR FILING
  // --------------------------------------------------
  {
    code: "PREVIOUS_TAX_RETURN",
    title: "Previous Income Tax Return",
    description:
      "Previous income tax return for reference and continuity review.",
    category: "PRIOR_FILING",
    responseType: "DOCUMENT",
  },
  {
    code: "PREVIOUS_WEALTH_STATEMENT",
    title: "Previous Wealth Statement",
    description:
      "Previous wealth statement for opening wealth and reconciliation review.",
    category: "PRIOR_FILING",
    responseType: "DOCUMENT",
  },

  // --------------------------------------------------
  // SALARY / EMPLOYMENT
  // --------------------------------------------------
  {
    code: "SALARY_CERTIFICATE",
    title: "Salary Certificate",
    description:
      "Salary certificate or equivalent employer-issued annual income evidence.",
    category: "INCOME",
    responseType: "DOCUMENT",
  },
  {
    code: "EMPLOYMENT_INCOME_INFORMATION",
    title: "Employment Income Information",
    description:
      "Employment and salary information required for the relevant tax year.",
    category: "INCOME",
    responseType: "INFORMATION",
  },

  // --------------------------------------------------
  // FREELANCE / PROFESSIONAL
  // --------------------------------------------------
  {
    code: "FREELANCE_INCOME_INFORMATION",
    title: "Freelance / Professional Income Information",
    description:
      "Summary of freelance or professional income earned during the tax year.",
    category: "INCOME",
    responseType: "INFORMATION",
  },
  {
    code: "FREELANCE_INCOME_EVIDENCE",
    title: "Freelance / Professional Income Evidence",
    description:
      "Invoices, statements, certificates or other supporting evidence for freelance or professional income.",
    category: "INCOME",
    responseType: "DOCUMENT_OR_INFORMATION",
  },

  // --------------------------------------------------
  // BUSINESS
  // --------------------------------------------------
  {
    code: "BUSINESS_INCOME_INFORMATION",
    title: "Business Income Information",
    description:
      "Summary of business revenue and other business income for the tax year.",
    category: "INCOME",
    responseType: "INFORMATION",
  },
  {
    code: "BUSINESS_EXPENSE_INFORMATION",
    title: "Business Expense Information",
    description:
      "Summary of business expenses relevant to preparation of the tax return.",
    category: "INCOME",
    responseType: "INFORMATION",
  },
  {
    code: "BUSINESS_SUPPORTING_RECORDS",
    title: "Business Supporting Records",
    description:
      "Relevant records supporting reported business income and expenses.",
    category: "INCOME",
    responseType: "DOCUMENT_OR_INFORMATION",
  },

  // --------------------------------------------------
  // RENTAL / PROPERTY INCOME
  // --------------------------------------------------
  {
    code: "RENTAL_INCOME_INFORMATION",
    title: "Rental Income Information",
    description:
      "Details of rental income received during the tax year.",
    category: "INCOME",
    responseType: "INFORMATION",
  },
  {
    code: "RENTAL_SUPPORTING_EVIDENCE",
    title: "Rental / Property Supporting Evidence",
    description:
      "Lease, rent statement or other evidence supporting rental income.",
    category: "INCOME",
    responseType: "DOCUMENT_OR_INFORMATION",
  },

  // --------------------------------------------------
  // CAPITAL GAINS
  // --------------------------------------------------
  {
    code: "CAPITAL_GAIN_INFORMATION",
    title: "Capital Gain Information",
    description:
      "Details of assets or investments disposed of during the tax year.",
    category: "INCOME",
    responseType: "INFORMATION",
  },
  {
    code: "CAPITAL_GAIN_EVIDENCE",
    title: "Capital Gain Supporting Evidence",
    description:
      "Purchase, sale or other records required to review reported capital gains.",
    category: "INCOME",
    responseType: "DOCUMENT_OR_INFORMATION",
  },

  // --------------------------------------------------
  // INVESTMENT / PROFIT
  // --------------------------------------------------
  {
    code: "INVESTMENT_INCOME_INFORMATION",
    title: "Investment / Profit Income Information",
    description:
      "Details of investment income or profit on debt received during the tax year.",
    category: "INCOME",
    responseType: "INFORMATION",
  },
  {
    code: "INVESTMENT_INCOME_EVIDENCE",
    title: "Investment / Profit Income Evidence",
    description:
      "Statements, certificates or other evidence supporting investment income.",
    category: "INCOME",
    responseType: "DOCUMENT_OR_INFORMATION",
  },

  // --------------------------------------------------
  // AGRICULTURAL
  // --------------------------------------------------
  {
    code: "AGRICULTURAL_INCOME_INFORMATION",
    title: "Agricultural Income Information",
    description:
      "Details of agricultural income relevant to the tax profile.",
    category: "INCOME",
    responseType: "INFORMATION",
  },

  // --------------------------------------------------
  // FOREIGN INCOME
  // --------------------------------------------------
  {
    code: "FOREIGN_INCOME_INFORMATION",
    title: "Foreign Income Information",
    description:
      "Details of foreign-source income relevant to the tax year.",
    category: "INCOME",
    responseType: "INFORMATION",
  },
  {
    code: "FOREIGN_INCOME_EVIDENCE",
    title: "Foreign Income Supporting Evidence",
    description:
      "Statements or other supporting records relating to foreign-source income.",
    category: "INCOME",
    responseType: "DOCUMENT_OR_INFORMATION",
  },

  // --------------------------------------------------
  // OTHER INCOME
  // --------------------------------------------------
  {
    code: "OTHER_INCOME_INFORMATION",
    title: "Other Income Information",
    description:
      "Details and supporting information for other income sources.",
    category: "INCOME",
    responseType: "DOCUMENT_OR_INFORMATION",
  },

  // --------------------------------------------------
  // BANKING
  // --------------------------------------------------
  {
    code: "BANK_ACCOUNT_INFORMATION",
    title: "Bank Account Information",
    description:
      "Details of relevant bank accounts maintained during the tax year.",
    category: "BANKING",
    responseType: "INFORMATION",
  },
  {
    code: "BANK_STATEMENT",
    title: "Bank Statement",
    description:
      "Relevant bank statement required for tax preparation and reconciliation.",
    category: "BANKING",
    responseType: "DOCUMENT",
  },

  // --------------------------------------------------
  // ASSETS
  // --------------------------------------------------
  {
    code: "CASH_FINANCIAL_ASSET_INFORMATION",
    title: "Cash & Financial Asset Information",
    description:
      "Details of cash and other financial assets relevant to the wealth position.",
    category: "ASSETS",
    responseType: "INFORMATION",
  },
  {
    code: "PROPERTY_INFORMATION",
    title: "Immovable Property Information",
    description:
      "Details of immovable property owned or held during the relevant period.",
    category: "ASSETS",
    responseType: "INFORMATION",
  },
  {
    code: "VEHICLE_INFORMATION",
    title: "Vehicle Information",
    description:
      "Details of vehicles relevant to the client's wealth position.",
    category: "ASSETS",
    responseType: "INFORMATION",
  },
  {
    code: "INVESTMENT_ASSET_INFORMATION",
    title: "Investment / Securities Information",
    description:
      "Details of investments and securities relevant to the client's wealth position.",
    category: "ASSETS",
    responseType: "INFORMATION",
  },
  {
    code: "BUSINESS_ASSET_INFORMATION",
    title: "Business Asset Information",
    description:
      "Details of business assets relevant to the client's wealth position.",
    category: "ASSETS",
    responseType: "INFORMATION",
  },
  {
    code: "FOREIGN_ASSET_INFORMATION",
    title: "Foreign Asset Information",
    description:
      "Details of foreign assets relevant to the client's tax and wealth profile.",
    category: "ASSETS",
    responseType: "INFORMATION",
  },
  {
    code: "OTHER_ASSET_INFORMATION",
    title: "Other Asset Information",
    description:
      "Details of other assets relevant to the client's wealth position.",
    category: "ASSETS",
    responseType: "INFORMATION",
  },

  // --------------------------------------------------
  // LIABILITIES
  // --------------------------------------------------
  {
    code: "LIABILITY_INFORMATION",
    title: "Liability / Loan Information",
    description:
      "Details of loans and other liabilities relevant to the client's wealth position.",
    category: "LIABILITIES",
    responseType: "INFORMATION",
  },
  {
    code: "LIABILITY_EVIDENCE",
    title: "Liability Supporting Evidence",
    description:
      "Statements or other supporting evidence for material loans or liabilities.",
    category: "LIABILITIES",
    responseType: "DOCUMENT_OR_INFORMATION",
  },

  // --------------------------------------------------
  // TAX / WITHHOLDING
  // --------------------------------------------------
  {
    code: "EMPLOYER_WITHHOLDING_EVIDENCE",
    title: "Employer Withholding Evidence",
    description:
      "Evidence of income tax deducted or withheld by an employer.",
    category: "TAX_WITHHOLDING",
    responseType: "DOCUMENT",
  },
  {
    code: "BANK_WITHHOLDING_EVIDENCE",
    title: "Bank / Profit-on-Debt Withholding Evidence",
    description:
      "Evidence of tax deducted or collected by a bank or financial institution.",
    category: "TAX_WITHHOLDING",
    responseType: "DOCUMENT",
  },
  {
    code: "PROPERTY_TAX_WITHHOLDING_EVIDENCE",
    title: "Property Tax / Withholding Evidence",
    description:
      "Evidence of relevant property-related tax deduction or collection.",
    category: "TAX_WITHHOLDING",
    responseType: "DOCUMENT_OR_INFORMATION",
  },
  {
    code: "VEHICLE_TAX_EVIDENCE",
    title: "Vehicle Tax Evidence",
    description:
      "Evidence of relevant tax paid, deducted or collected in relation to a vehicle.",
    category: "TAX_WITHHOLDING",
    responseType: "DOCUMENT_OR_INFORMATION",
  },
  {
    code: "BUSINESS_WITHHOLDING_EVIDENCE",
    title: "Business / Customer Withholding Evidence",
    description:
      "Certificates or other evidence of tax withheld by customers or business counterparties.",
    category: "TAX_WITHHOLDING",
    responseType: "DOCUMENT_OR_INFORMATION",
  },
  {
    code: "ADVANCE_TAX_PAYMENT_EVIDENCE",
    title: "Advance Tax Payment Evidence",
    description:
      "Evidence of advance tax payments made during the relevant tax year.",
    category: "TAX_WITHHOLDING",
    responseType: "DOCUMENT",
  },
  {
    code: "OTHER_TAX_DEDUCTED_EVIDENCE",
    title: "Other Tax Deducted / Collected Evidence",
    description:
      "Evidence of other relevant taxes deducted, collected or paid during the tax year.",
    category: "TAX_WITHHOLDING",
    responseType: "DOCUMENT_OR_INFORMATION",
  },
];