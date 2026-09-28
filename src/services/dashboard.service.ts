import {
  ClientRequestStatus,
  DocumentStatus,
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

const OPEN_REQUEST_STATUSES: ClientRequestStatus[] = [
  ClientRequestStatus.DRAFT,
  ClientRequestStatus.SENT,
  ClientRequestStatus.VIEWED,
  ClientRequestStatus.SUBMITTED,
];

function getClientName(client: {
  type: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
}) {
  if (client.type === "BUSINESS") {
    return client.businessName?.trim() || "Unnamed business";
  }

  return (
    `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() ||
    "Unnamed client"
  );
}

function getReadinessLabel(status: TaxReadinessStatus) {
  switch (status) {
    case TaxReadinessStatus.TAX_READY:
      return "Tax Ready";
    case TaxReadinessStatus.READY_FOR_REVIEW:
      return "Ready for Review";
    case TaxReadinessStatus.BLOCKED:
      return "Blocked";
    default:
      return "In Progress";
  }
}

export async function getDashboardDataForUser(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId,
    },
    select: {
      organizationId: true,
      organization: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!membership) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  const organizationId = membership.organizationId;
  const now = new Date();

  const [
    clients,
    openRequestCount,
    blockingExceptionCount,
    documentsNeedingReviewCount,
  ] = await Promise.all([
    prisma.client.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        type: true,
        firstName: true,
        lastName: true,
        businessName: true,
        taxYear: true,
        taxReadinessStatus: true,
        createdAt: true,
        updatedAt: true,

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
            updatedAt: true,
            requirementDefinition: {
              select: {
                title: true,
              },
            },
          },
        },

        requests: {
          where: {
            status: {
              in: OPEN_REQUEST_STATUSES,
            },
          },
          select: {
            id: true,
            status: true,
            dueAt: true,
            updatedAt: true,
            clientRequirement: {
              select: {
                requirementDefinition: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },

        documents: {
          where: {
            status: {
              in: [
                DocumentStatus.UPLOADED,
                DocumentStatus.NEEDS_REVIEW,
              ],
            },
          },
          select: {
            id: true,
            fileName: true,
            status: true,
            updatedAt: true,
            clientRequirement: {
              select: {
                requirementDefinition: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
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
            title: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),

    prisma.clientRequest.count({
      where: {
        client: {
          organizationId,
          status: "ACTIVE",
        },
        status: {
          in: OPEN_REQUEST_STATUSES,
        },
      },
    }),

    prisma.complianceException.count({
      where: {
        organizationId,
        client: {
          status: "ACTIVE",
        },
        severity: ExceptionSeverity.BLOCKING,
        status: {
          in: ACTIVE_EXCEPTION_STATUSES,
        },
      },
    }),

    prisma.document.count({
      where: {
        organizationId,
        client: {
          status: "ACTIVE",
        },
        status: {
          in: [
            DocumentStatus.UPLOADED,
            DocumentStatus.NEEDS_REVIEW,
          ],
        },
      },
    }),
  ]);

  const clientRows = clients.map((client) => {
    const totalRequired = client.requirements.length;

    const completedRequired = client.requirements.filter((requirement) =>
      SATISFIED_REQUIREMENT_STATUSES.includes(requirement.status),
    ).length;

    const percentage =
      totalRequired === 0
        ? 0
        : Math.round((completedRequired / totalRequired) * 100);

    const blockingException = client.complianceExceptions[0];

    const reviewDocument = client.documents.find(
      (document) =>
        document.status === DocumentStatus.NEEDS_REVIEW ||
        document.status === DocumentStatus.UPLOADED,
    );

    const overdueRequest = client.requests.find(
      (request) =>
        request.dueAt &&
        request.dueAt.getTime() < now.getTime() &&
        request.status !== ClientRequestStatus.SUBMITTED,
    );

    const submittedRequest = client.requests.find(
      (request) => request.status === ClientRequestStatus.SUBMITTED,
    );

    const outstandingRequirement = client.requirements.find(
      (requirement) =>
        !SATISFIED_REQUIREMENT_STATUSES.includes(requirement.status),
    );

    let nextAction = "Preparation in progress";
    let nextActionType:
      | "complete"
      | "exception"
      | "document"
      | "overdue"
      | "request"
      | "requirement" = "requirement";

    if (client.taxReadinessStatus === TaxReadinessStatus.TAX_READY) {
      nextAction = "Preparation complete";
      nextActionType = "complete";
    } else if (blockingException) {
      nextAction = blockingException.title;
      nextActionType = "exception";
    } else if (reviewDocument) {
      nextAction =
        reviewDocument.clientRequirement?.requirementDefinition.title ??
        reviewDocument.fileName;
      nextActionType = "document";
    } else if (overdueRequest) {
      nextAction =
        overdueRequest.clientRequirement.requirementDefinition.title;
      nextActionType = "overdue";
    } else if (submittedRequest) {
      nextAction =
        submittedRequest.clientRequirement.requirementDefinition.title;
      nextActionType = "request";
    } else if (outstandingRequirement) {
      nextAction =
        outstandingRequirement.requirementDefinition.title;
      nextActionType = "requirement";
    } else if (
      client.taxReadinessStatus ===
      TaxReadinessStatus.READY_FOR_REVIEW
    ) {
      nextAction = "Final practitioner review";
      nextActionType = "request";
    }

    return {
      id: client.id,
      name: getClientName(client),
      type: client.type,
      taxYear: client.taxYear,
      readinessStatus: client.taxReadinessStatus,
      readinessLabel: getReadinessLabel(
        client.taxReadinessStatus,
      ),
      percentage,
      completedRequired,
      totalRequired,
      nextAction,
      nextActionType,
      updatedAt: client.updatedAt,
    };
  });

  const readiness = {
    taxReady: clientRows.filter(
      (client) =>
        client.readinessStatus === TaxReadinessStatus.TAX_READY,
    ).length,

    readyForReview: clientRows.filter(
      (client) =>
        client.readinessStatus ===
        TaxReadinessStatus.READY_FOR_REVIEW,
    ).length,

    inProgress: clientRows.filter(
      (client) =>
        client.readinessStatus ===
        TaxReadinessStatus.IN_PROGRESS,
    ).length,

    blocked: clientRows.filter(
      (client) =>
        client.readinessStatus === TaxReadinessStatus.BLOCKED,
    ).length,
  };

  const totalRequirements = clientRows.reduce(
    (sum, client) => sum + client.totalRequired,
    0,
  );

  const completedRequirements = clientRows.reduce(
    (sum, client) => sum + client.completedRequired,
    0,
  );

  const overallPreparationPercentage =
    totalRequirements === 0
      ? 0
      : Math.round(
          (completedRequirements / totalRequirements) * 100,
        );

  const needsAttention = clientRows
    .filter((client) =>
      [
        "exception",
        "document",
        "overdue",
        "request",
      ].includes(client.nextActionType),
    )
    .sort((a, b) => {
      const priority = {
        exception: 0,
        document: 1,
        overdue: 2,
        request: 3,
        requirement: 4,
        complete: 5,
      } as const;

      return (
        priority[a.nextActionType] -
        priority[b.nextActionType]
      );
    })
    .slice(0, 6);

  return {
    organization: {
      id: organizationId,
      name: membership.organization.name,
    },

    summary: {
      totalClients: clientRows.length,
      taxReadyClients: readiness.taxReady,
      openRequests: openRequestCount,
      blockingExceptions: blockingExceptionCount,
      documentsNeedingReview: documentsNeedingReviewCount,
      overallPreparationPercentage,
      totalRequirements,
      completedRequirements,
    },

    readiness,

    clients: clientRows,
    needsAttention,
    recentClients: clientRows.slice(0, 6),
  };
}

export type DashboardData = Awaited<
  ReturnType<typeof getDashboardDataForUser>
>;