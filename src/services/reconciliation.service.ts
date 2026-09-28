import {
  IncomeSourceType,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import {
  createReconciliationException,
  createWealthMovementException,
  resolveReconciliationExceptions,
  resolveWealthMovementExceptions,
} from "@/services/exception.service";

type SupportedReconciliation = {
  incomeSource: IncomeSourceType;
  extractedFieldKey: string;
  label: string;
};

const SUPPORTED_RECONCILIATIONS: SupportedReconciliation[] =
  [
    {
      incomeSource:
        IncomeSourceType.SALARY_EMPLOYMENT,
      extractedFieldKey: "gross_salary",
      label: "Gross salary",
    },
    {
      incomeSource:
        IncomeSourceType.RENTAL_PROPERTY,
      extractedFieldKey:
        "gross_rent_received",
      label: "Gross rental income",
    },
    {
      incomeSource:
        IncomeSourceType.INVESTMENT_PROFIT,
      extractedFieldKey: "profit_return",
      label: "Investment / profit income",
    },
  ];

function normalizeMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function toCents(value: number) {
  return Math.round(value * 100);
}

export async function reconcileDocument(
  input: {
    organizationId: string;
    documentId: string;
    performedByUserId: string;
  },
) {
  const document =
    await prisma.document.findFirst({
      where: {
        id: input.documentId,
        organizationId: input.organizationId,
      },

      select: {
        id: true,
        clientId: true,
        clientRequirementId: true,

        client: {
          select: {
            taxProfile: {
              select: {
                incomeSources: {
                  select: {
                    type: true,
                    declaredAmount: true,
                  },
                },
              },
            },
          },
        },

        extraction: {
          select: {
            status: true,

            fields: {
              select: {
                key: true,
                numericValue: true,
              },
            },
          },
        },
      },
    });

  if (!document) {
    throw new Error("DOCUMENT_NOT_FOUND");
  }

  if (!document.extraction) {
    return {
      status: "NOT_CHECKED" as const,
      reason: "NO_EXTRACTION",
      comparisons: [],
    };
  }

  const incomeSources =
    document.client.taxProfile?.incomeSources ??
    [];

  const extractedFields = new Map(
    document.extraction.fields.map(
      (field) => [
        field.key,
        field.numericValue === null
          ? null
          : Number(field.numericValue),
      ],
    ),
  );

  const comparisons: Array<{
    incomeSource: IncomeSourceType;
    label: string;
    declaredAmount: number;
    extractedAmount: number;
    matches: boolean;
  }> = [];

  for (const rule of SUPPORTED_RECONCILIATIONS) {
    const source = incomeSources.find(
      (item) =>
        item.type === rule.incomeSource,
    );

    if (
      !source ||
      source.declaredAmount === null
    ) {
      continue;
    }

    const extractedAmount =
      extractedFields.get(
        rule.extractedFieldKey,
      );

    if (
      extractedAmount === null ||
      extractedAmount === undefined
    ) {
      continue;
    }

    const declaredAmount = normalizeMoney(
      Number(source.declaredAmount),
    );

    const normalizedExtractedAmount =
      normalizeMoney(extractedAmount);

    comparisons.push({
      incomeSource: rule.incomeSource,
      label: rule.label,
      declaredAmount,
      extractedAmount:
        normalizedExtractedAmount,
      matches:
        declaredAmount ===
        normalizedExtractedAmount,
    });
  }

  if (comparisons.length === 0) {
    return {
      status: "NOT_CHECKED" as const,
      reason:
        "NO_SUPPORTED_COMPARISON",
      comparisons,
    };
  }

  const mismatches = comparisons.filter(
    (comparison) => !comparison.matches,
  );

  if (mismatches.length > 0) {
    const mismatch = mismatches[0];

    await createReconciliationException({
      organizationId:
        input.organizationId,
      clientId: document.clientId,
      clientRequirementId:
        document.clientRequirementId,
      documentId: document.id,
      fieldLabel: mismatch.label,
      declaredAmount:
        mismatch.declaredAmount,
      extractedAmount:
        mismatch.extractedAmount,
      createdByUserId:
        input.performedByUserId,
    });

    return {
      status: "MISMATCH" as const,
      reason: null,
      comparisons,
    };
  }

  await resolveReconciliationExceptions({
    organizationId:
      input.organizationId,
    documentId: document.id,
    resolvedByUserId:
      input.performedByUserId,
  });

  return {
    status: "MATCHED" as const,
    reason: null,
    comparisons,
  };
}

export async function reconcileWealthMovement(
  input: {
    organizationId: string;
    clientId: string;
    performedByUserId: string;
  },
) {
  const client =
    await prisma.client.findFirst({
      where: {
        id: input.clientId,
        organizationId: input.organizationId,
      },
      select: {
        id: true,

        taxProfile: {
          select: {
            openingWealth: true,
            wealthAdditions: true,
            wealthReductions: true,
            closingWealth: true,
          },
        },
      },
    });

  if (!client) {
    throw new Error("CLIENT_NOT_FOUND");
  }

  const profile = client.taxProfile;

  if (!profile) {
    await resolveWealthMovementExceptions({
      organizationId:
        input.organizationId,
      clientId: client.id,
      resolvedByUserId:
        input.performedByUserId,
      resolutionNote:
        "Wealth movement check is no longer applicable because complete wealth values are not available.",
    });

    return {
      status: "NOT_CHECKED" as const,
      reason: "NO_TAX_PROFILE",
    };
  }

  const hasCompleteValues =
    profile.openingWealth !== null &&
    profile.wealthAdditions !== null &&
    profile.wealthReductions !== null &&
    profile.closingWealth !== null;

  if (!hasCompleteValues) {
    await resolveWealthMovementExceptions({
      organizationId:
        input.organizationId,
      clientId: client.id,
      resolvedByUserId:
        input.performedByUserId,
      resolutionNote:
        "Wealth movement check is not active because all four wealth values are not available.",
    });

    return {
      status: "NOT_CHECKED" as const,
      reason: "INCOMPLETE_WEALTH_DATA",
    };
  }

  const openingWealth = Number(
    profile.openingWealth,
  );

  const wealthAdditions = Number(
    profile.wealthAdditions,
  );

  const wealthReductions = Number(
    profile.wealthReductions,
  );

  const declaredClosingWealth = Number(
    profile.closingWealth,
  );

  const expectedClosingWealth =
    normalizeMoney(
      openingWealth +
        wealthAdditions -
        wealthReductions,
    );

  const matches =
    toCents(expectedClosingWealth) ===
    toCents(declaredClosingWealth);

  if (!matches) {
    await createWealthMovementException({
      organizationId:
        input.organizationId,
      clientId: client.id,

      openingWealth:
        normalizeMoney(openingWealth),

      wealthAdditions:
        normalizeMoney(wealthAdditions),

      wealthReductions:
        normalizeMoney(wealthReductions),

      expectedClosingWealth,

      declaredClosingWealth:
        normalizeMoney(
          declaredClosingWealth,
        ),

      createdByUserId:
        input.performedByUserId,
    });

    return {
      status: "MISMATCH" as const,
      reason: null,

      openingWealth:
        normalizeMoney(openingWealth),

      wealthAdditions:
        normalizeMoney(wealthAdditions),

      wealthReductions:
        normalizeMoney(wealthReductions),

      expectedClosingWealth,

      declaredClosingWealth:
        normalizeMoney(
          declaredClosingWealth,
        ),
    };
  }

  await resolveWealthMovementExceptions({
    organizationId:
      input.organizationId,
    clientId: client.id,
    resolvedByUserId:
      input.performedByUserId,
  });

  return {
    status: "MATCHED" as const,
    reason: null,

    openingWealth:
      normalizeMoney(openingWealth),

    wealthAdditions:
      normalizeMoney(wealthAdditions),

    wealthReductions:
      normalizeMoney(wealthReductions),

    expectedClosingWealth,

    declaredClosingWealth:
      normalizeMoney(
        declaredClosingWealth,
      ),
  };
}