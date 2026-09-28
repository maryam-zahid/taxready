import {
  ExceptionSeverity,
  ExceptionSource,
  ExceptionStatus,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

const ACTIVE_EXCEPTION_STATUSES = [
  ExceptionStatus.OPEN,
  ExceptionStatus.WAITING_CLIENT,
  ExceptionStatus.UNDER_REVIEW,
];

const WEALTH_MOVEMENT_EXCEPTION_TITLE =
  "Wealth movement mismatch";

type CreateDocumentReviewExceptionInput = {
  organizationId: string;
  clientId: string;
  clientRequirementId: string | null;
  documentId: string;
  documentFileName: string;
  reviewNote: string;
  createdByUserId: string;
  rejected: boolean;
};

export async function createDocumentReviewException(
  input: CreateDocumentReviewExceptionInput,
) {
  const existingException =
    await prisma.complianceException.findFirst({
      where: {
        organizationId: input.organizationId,
        clientId: input.clientId,
        documentId: input.documentId,
        source: ExceptionSource.DOCUMENT_REVIEW,
        status: {
          in: ACTIVE_EXCEPTION_STATUSES,
        },
      },
      select: {
        id: true,
      },
    });

  if (existingException) {
    return prisma.complianceException.update({
      where: {
        id: existingException.id,
      },
      data: {
        title: input.rejected
          ? "Document rejected"
          : "Document needs review",
        description: input.reviewNote,
        severity: ExceptionSeverity.BLOCKING,
      },
    });
  }

  return prisma.complianceException.create({
    data: {
      organizationId: input.organizationId,
      clientId: input.clientId,
      clientRequirementId:
        input.clientRequirementId,
      documentId: input.documentId,

      title: input.rejected
        ? "Document rejected"
        : "Document needs review",

      description: input.reviewNote,

      status: ExceptionStatus.OPEN,
      severity: ExceptionSeverity.BLOCKING,
      source: ExceptionSource.DOCUMENT_REVIEW,

      createdByUserId: input.createdByUserId,
    },
  });
}

export async function resolveDocumentReviewExceptions(
  input: {
    organizationId: string;
    documentId: string;
    resolvedByUserId: string;
    resolutionNote?: string | null;
  },
) {
  return prisma.complianceException.updateMany({
    where: {
      organizationId: input.organizationId,
      documentId: input.documentId,
      source: ExceptionSource.DOCUMENT_REVIEW,
      status: {
        in: ACTIVE_EXCEPTION_STATUSES,
      },
    },
    data: {
      status: ExceptionStatus.RESOLVED,
      resolvedByUserId: input.resolvedByUserId,
      resolvedAt: new Date(),
      resolutionNote:
        input.resolutionNote?.trim() ||
        "Document approved after review.",
    },
  });
}

export async function getExceptionsForOrganization(
  organizationId: string,
) {
  return prisma.complianceException.findMany({
    where: {
      organizationId,
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          businessName: true,
          email: true,
        },
      },

      document: {
        select: {
          id: true,
          fileName: true,
          status: true,
        },
      },

      clientRequirement: {
        select: {
          id: true,
          requirementDefinition: {
            select: {
              title: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function getExceptionForOrganization(
  organizationId: string,
  exceptionId: string,
) {
  return prisma.complianceException.findFirst({
    where: {
      id: exceptionId,
      organizationId,
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          businessName: true,
          email: true,
        },
      },

      document: {
        select: {
          id: true,
          fileName: true,
          status: true,
          uploadedAt: true,
        },
      },

      clientRequirement: {
        select: {
          id: true,
          status: true,
          requirementDefinition: {
            select: {
              title: true,
              description: true,
              category: true,
            },
          },
        },
      },
    },
  });
}

type CreateReconciliationExceptionInput = {
  organizationId: string;
  clientId: string;
  clientRequirementId: string | null;
  documentId: string;
  fieldLabel: string;
  declaredAmount: number;
  extractedAmount: number;
  createdByUserId: string;
};

export async function createReconciliationException(
  input: CreateReconciliationExceptionInput,
) {
  const existingException =
    await prisma.complianceException.findFirst({
      where: {
        organizationId: input.organizationId,
        clientId: input.clientId,
        documentId: input.documentId,
        source: ExceptionSource.RECONCILIATION,
        status: {
          in: ACTIVE_EXCEPTION_STATUSES,
        },
      },
      select: {
        id: true,
      },
    });

  const difference =
    input.extractedAmount -
    input.declaredAmount;

  const description = [
    `${input.fieldLabel} does not match the amount declared in the client's tax profile.`,
    `Declared: PKR ${input.declaredAmount.toLocaleString("en-PK")}.`,
    `Document: PKR ${input.extractedAmount.toLocaleString("en-PK")}.`,
    `Difference: PKR ${Math.abs(difference).toLocaleString("en-PK")}.`,
  ].join(" ");

  if (existingException) {
    return prisma.complianceException.update({
      where: {
        id: existingException.id,
      },
      data: {
        title: `${input.fieldLabel} mismatch`,
        description,
        severity: ExceptionSeverity.BLOCKING,
      },
    });
  }

  return prisma.complianceException.create({
    data: {
      organizationId: input.organizationId,
      clientId: input.clientId,
      clientRequirementId:
        input.clientRequirementId,
      documentId: input.documentId,

      title: `${input.fieldLabel} mismatch`,
      description,

      status: ExceptionStatus.OPEN,
      severity: ExceptionSeverity.BLOCKING,
      source: ExceptionSource.RECONCILIATION,

      createdByUserId: input.createdByUserId,
    },
  });
}

export async function resolveReconciliationExceptions(
  input: {
    organizationId: string;
    documentId: string;
    resolvedByUserId: string;
  },
) {
  return prisma.complianceException.updateMany({
    where: {
      organizationId: input.organizationId,
      documentId: input.documentId,
      source: ExceptionSource.RECONCILIATION,
      status: {
        in: ACTIVE_EXCEPTION_STATUSES,
      },
    },

    data: {
      status: ExceptionStatus.RESOLVED,
      resolvedByUserId: input.resolvedByUserId,
      resolvedAt: new Date(),
      resolutionNote:
        "Document amount matches the declared tax profile amount.",
    },
  });
}

type CreateWealthMovementExceptionInput = {
  organizationId: string;
  clientId: string;
  openingWealth: number;
  wealthAdditions: number;
  wealthReductions: number;
  expectedClosingWealth: number;
  declaredClosingWealth: number;
  createdByUserId: string;
};

export async function createWealthMovementException(
  input: CreateWealthMovementExceptionInput,
) {
  const existingException =
    await prisma.complianceException.findFirst({
      where: {
        organizationId: input.organizationId,
        clientId: input.clientId,
        documentId: null,
        clientRequirementId: null,
        source: ExceptionSource.RECONCILIATION,
        title: WEALTH_MOVEMENT_EXCEPTION_TITLE,
        status: {
          in: ACTIVE_EXCEPTION_STATUSES,
        },
      },
      select: {
        id: true,
      },
    });

  const difference =
    input.declaredClosingWealth -
    input.expectedClosingWealth;

  const description = [
    "The client's closing wealth does not reconcile with the recorded wealth movement.",
    `Opening wealth: PKR ${input.openingWealth.toLocaleString("en-PK")}.`,
    `Additions: PKR ${input.wealthAdditions.toLocaleString("en-PK")}.`,
    `Reductions: PKR ${input.wealthReductions.toLocaleString("en-PK")}.`,
    `Expected closing wealth: PKR ${input.expectedClosingWealth.toLocaleString("en-PK")}.`,
    `Declared closing wealth: PKR ${input.declaredClosingWealth.toLocaleString("en-PK")}.`,
    `Difference: PKR ${Math.abs(difference).toLocaleString("en-PK")}.`,
  ].join(" ");

  if (existingException) {
    return prisma.complianceException.update({
      where: {
        id: existingException.id,
      },
      data: {
        description,
        severity: ExceptionSeverity.BLOCKING,
      },
    });
  }

  return prisma.complianceException.create({
    data: {
      organizationId: input.organizationId,
      clientId: input.clientId,

      clientRequirementId: null,
      documentId: null,

      title: WEALTH_MOVEMENT_EXCEPTION_TITLE,
      description,

      status: ExceptionStatus.OPEN,
      severity: ExceptionSeverity.BLOCKING,
      source: ExceptionSource.RECONCILIATION,

      createdByUserId: input.createdByUserId,
    },
  });
}

export async function resolveWealthMovementExceptions(
  input: {
    organizationId: string;
    clientId: string;
    resolvedByUserId: string;
    resolutionNote?: string;
  },
) {
  return prisma.complianceException.updateMany({
    where: {
      organizationId: input.organizationId,
      clientId: input.clientId,
      documentId: null,
      clientRequirementId: null,
      source: ExceptionSource.RECONCILIATION,
      title: WEALTH_MOVEMENT_EXCEPTION_TITLE,
      status: {
        in: ACTIVE_EXCEPTION_STATUSES,
      },
    },
    data: {
      status: ExceptionStatus.RESOLVED,
      resolvedByUserId: input.resolvedByUserId,
      resolvedAt: new Date(),
      resolutionNote:
        input.resolutionNote ??
        "Wealth movement now reconciles with the declared closing wealth.",
    },
  });
}