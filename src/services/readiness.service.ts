import {
  ExceptionSeverity,
  ExceptionStatus,
  RequirementStatus,
  TaxReadinessStatus,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

const SATISFIED_REQUIREMENT_STATUSES: RequirementStatus[] = [
  RequirementStatus.COMPLETED,
  RequirementStatus.WAIVED,
];

const ACTIVE_EXCEPTION_STATUSES: ExceptionStatus[] = [
  ExceptionStatus.OPEN,
  ExceptionStatus.WAITING_CLIENT,
  ExceptionStatus.UNDER_REVIEW,
];

export async function calculateClientReadiness(
  input: {
    organizationId: string;
    clientId: string;
  },
) {
  const client = await prisma.client.findFirst({
    where: {
      id: input.clientId,
      organizationId: input.organizationId,
    },

    select: {
      id: true,
      taxReadinessStatus: true,

      requirements: {
        where: {
          required: true,

          status: {
            not: RequirementStatus.NOT_APPLICABLE,
          },
        },

        select: {
          id: true,
          status: true,
        },
      },

      complianceExceptions: {
        where: {
          severity: ExceptionSeverity.BLOCKING,

          status: {
            in: ACTIVE_EXCEPTION_STATUSES,
          },
        },

        select: {
          id: true,
        },
      },
    },
  });

  if (!client) {
    throw new Error("CLIENT_NOT_FOUND");
  }

  const totalRequired =
    client.requirements.length;

  const completedRequired =
    client.requirements.filter(
      (requirement) =>
        SATISFIED_REQUIREMENT_STATUSES.includes(
          requirement.status,
        ),
    ).length;

  const percentage =
    totalRequired === 0
      ? 0
      : Math.round(
          (completedRequired / totalRequired) *
            100,
        );

  const blockingExceptionCount =
    client.complianceExceptions.length;

  let calculatedStatus:
    | "IN_PROGRESS"
    | "BLOCKED"
    | "READY_FOR_REVIEW";

  if (blockingExceptionCount > 0) {
    calculatedStatus = "BLOCKED";
  } else if (
    totalRequired > 0 &&
    completedRequired === totalRequired
  ) {
    calculatedStatus = "READY_FOR_REVIEW";
  } else {
    calculatedStatus = "IN_PROGRESS";
  }

  /*
   * TAX_READY is an explicit practitioner decision.
   * Never grant it automatically.
   */
  const effectiveStatus =
    client.taxReadinessStatus ===
      TaxReadinessStatus.TAX_READY &&
    calculatedStatus === "READY_FOR_REVIEW"
      ? TaxReadinessStatus.TAX_READY
      : TaxReadinessStatus[
          calculatedStatus
        ];

  if (
    client.taxReadinessStatus !==
    effectiveStatus
  ) {
    await prisma.client.update({
      where: {
        id: client.id,
      },

      data: {
        taxReadinessStatus:
          effectiveStatus,

        ...(effectiveStatus !==
        TaxReadinessStatus.TAX_READY
          ? {
              taxReadyAt: null,
              taxReadyByUserId: null,
            }
          : {}),
      },
    });
  }

  return {
    percentage,
    totalRequired,
    completedRequired,
    blockingExceptionCount,
    status: effectiveStatus,
  };
}

export async function markClientTaxReady(
  input: {
    organizationId: string;
    clientId: string;
    userId: string;
  },
) {
  const readiness =
    await calculateClientReadiness({
      organizationId:
        input.organizationId,
      clientId: input.clientId,
    });

  if (
    readiness.status !==
    TaxReadinessStatus.READY_FOR_REVIEW
  ) {
    throw new Error(
      "CLIENT_NOT_READY_FOR_REVIEW",
    );
  }

  await prisma.client.update({
    where: {
      id: input.clientId,
    },

    data: {
      taxReadinessStatus:
        TaxReadinessStatus.TAX_READY,

      taxReadyAt: new Date(),
      taxReadyByUserId: input.userId,
    },
  });

  return {
    ...readiness,
    status: TaxReadinessStatus.TAX_READY,
  };
}