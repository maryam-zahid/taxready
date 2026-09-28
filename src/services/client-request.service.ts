import { ClientRequestStatus, RequirementStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createClientRequestSchema,
  type CreateClientRequestInput,
} from "@/lib/validations/client-request";

async function getOrganizationIdForUser(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId,
    },
    select: {
      organizationId: true,
    },
  });

  if (!membership) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  return membership.organizationId;
}

export async function createClientRequestForUser(
  userId: string,
  clientId: string,
  input: CreateClientRequestInput,
) {
  const data = createClientRequestSchema.parse(input);

  const organizationId = await getOrganizationIdForUser(userId);

  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!client) {
    throw new Error("CLIENT_NOT_FOUND");
  }

  const requirement = await prisma.clientRequirement.findFirst({
    where: {
      id: data.clientRequirementId,
      clientId,
    },
    include: {
requirementDefinition: true,
    },
  });

  if (!requirement) {
    throw new Error("REQUIREMENT_NOT_FOUND");
  }

  if (
    requirement.status === RequirementStatus.COMPLETED ||
    requirement.status === RequirementStatus.NOT_APPLICABLE ||
    requirement.status === RequirementStatus.WAIVED
  ) {
    throw new Error("REQUIREMENT_NOT_REQUESTABLE");
  }

  const existingActiveRequest = await prisma.clientRequest.findFirst({
    where: {
      clientRequirementId: requirement.id,
      status: {
        in: [
          ClientRequestStatus.DRAFT,
          ClientRequestStatus.SENT,
          ClientRequestStatus.VIEWED,
          ClientRequestStatus.SUBMITTED,
        ],
      },
    },
    select: {
      id: true,
    },
  });

  if (existingActiveRequest) {
    throw new Error("ACTIVE_REQUEST_ALREADY_EXISTS");
  }

  return prisma.clientRequest.create({
    data: {
      clientId,
      clientRequirementId: requirement.id,
      subject: data.subject,
      message: data.message || null,
      dueAt: data.dueAt ?? null,
      status: ClientRequestStatus.DRAFT,
    },
   include: {
  clientRequirement: {
    include: {
      requirementDefinition: true,
    },
  },
  responses: {
    where: {
      status: "SUBMITTED",
    },
    orderBy: {
      submittedAt: "desc",
    },
    take: 1,
  },
},
  });
}

export async function getClientRequestsForUser(
  userId: string,
  clientId: string,
) {
  const organizationId = await getOrganizationIdForUser(userId);

  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!client) {
    throw new Error("CLIENT_NOT_FOUND");
  }

 return prisma.clientRequest.findMany({
  where: {
    clientId,
  },
  include: {
    clientRequirement: {
      include: {
        requirementDefinition: true,
      },
    },
    responses: {
      where: {
        status: "SUBMITTED",
      },
      orderBy: {
        submittedAt: "desc",
      },
      take: 1,
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});
}
export async function sendClientRequestForUser(
  userId: string,
  requestId: string,
) {
  const organizationId = await getOrganizationIdForUser(userId);

  const request = await prisma.clientRequest.findFirst({
    where: {
      id: requestId,
      client: {
        organizationId,
      },
    },
    include: {
      clientRequirement: true,
    },
  });

  if (!request) {
    throw new Error("REQUEST_NOT_FOUND");
  }

  if (request.status !== ClientRequestStatus.DRAFT) {
    throw new Error("REQUEST_NOT_DRAFT");
  }

  if (
    request.clientRequirement.status === RequirementStatus.COMPLETED ||
    request.clientRequirement.status === RequirementStatus.NOT_APPLICABLE ||
    request.clientRequirement.status === RequirementStatus.WAIVED
  ) {
    throw new Error("REQUIREMENT_NOT_REQUESTABLE");
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const sentRequest = await tx.clientRequest.update({
      where: {
        id: request.id,
      },
      data: {
        status: ClientRequestStatus.SENT,
        sentAt: now,
      },
      include: {
        clientRequirement: {
          include: {
            requirementDefinition: true,
          },
        },
      },
    });

    await tx.clientRequirement.update({
      where: {
        id: request.clientRequirementId,
      },
      data: {
        status: RequirementStatus.REQUESTED,
      },
    });

    return sentRequest;
  });
}

export async function completeSubmittedInformationRequestForUser(
  userId: string,
  clientId: string,
  requestId: string,
) {
  const organizationId =
    await getOrganizationIdForUser(userId);

  const request =
    await prisma.clientRequest.findFirst({
      where: {
        id: requestId,
        clientId,
        client: {
          organizationId,
        },
      },
      include: {
        clientRequirement: {
          include: {
            requirementDefinition: true,
          },
        },
        responses: {
          where: {
            status: "SUBMITTED",
          },
          orderBy: {
            submittedAt: "desc",
          },
          take: 1,
        },
      },
    });

  if (!request) {
    throw new Error("REQUEST_NOT_FOUND");
  }

  if (
    request.status !== ClientRequestStatus.SUBMITTED
  ) {
    throw new Error("REQUEST_NOT_SUBMITTED");
  }

  const responseType =
    request.clientRequirement
      .requirementDefinition.responseType;

  if (
    responseType !== "INFORMATION" &&
    responseType !== "DOCUMENT_OR_INFORMATION"
  ) {
    throw new Error(
      "INFORMATION_RESPONSE_NOT_ALLOWED",
    );
  }

  if (request.responses.length === 0) {
    throw new Error(
      "SUBMITTED_INFORMATION_RESPONSE_NOT_FOUND",
    );
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    await tx.clientRequirement.update({
      where: {
        id: request.clientRequirementId,
      },
      data: {
        status: RequirementStatus.COMPLETED,
        completedAt: now,
        waivedAt: null,
      },
    });

    return tx.clientRequest.update({
      where: {
        id: request.id,
      },
      data: {
        status: ClientRequestStatus.COMPLETED,
        completedAt: now,
      },
    });
  });
}

export async function updateClientRequestForUser(
  userId: string,
  clientId: string,
  requestId: string,
  input: {
    subject: string;
    message?: string;
    dueAt?: Date | null;
  },
) {
  const organizationId =
    await getOrganizationIdForUser(userId);

  const request =
    await prisma.clientRequest.findFirst({
      where: {
        id: requestId,
        clientId,
        client: {
          organizationId,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

  if (!request) {
    throw new Error("REQUEST_NOT_FOUND");
  }

  if (
    request.status !== ClientRequestStatus.DRAFT &&
    request.status !== ClientRequestStatus.SENT &&
    request.status !== ClientRequestStatus.VIEWED
  ) {
    throw new Error("REQUEST_NOT_EDITABLE");
  }

  const subject = input.subject.trim();
  const message = input.message?.trim();

  if (!subject) {
    throw new Error("REQUEST_SUBJECT_REQUIRED");
  }

  return prisma.clientRequest.update({
    where: {
      id: request.id,
    },
    data: {
      subject,
      message: message || null,
      dueAt: input.dueAt ?? null,
    },
  });
}

export async function cancelClientRequestForUser(
  userId: string,
  clientId: string,
  requestId: string,
) {
  const organizationId =
    await getOrganizationIdForUser(userId);

  const request =
    await prisma.clientRequest.findFirst({
      where: {
        id: requestId,
        clientId,
        client: {
          organizationId,
        },
      },
      include: {
        clientRequirement: true,
      },
    });

  if (!request) {
    throw new Error("REQUEST_NOT_FOUND");
  }

  if (
    request.status !== ClientRequestStatus.SENT &&
    request.status !== ClientRequestStatus.VIEWED
  ) {
    throw new Error("REQUEST_NOT_CANCELLABLE");
  }

  return prisma.$transaction(async (tx) => {
    const cancelledRequest =
      await tx.clientRequest.update({
        where: {
          id: request.id,
        },
        data: {
          status: ClientRequestStatus.CANCELLED,
        },
      });

    if (
      request.clientRequirement.status ===
      RequirementStatus.REQUESTED
    ) {
      await tx.clientRequirement.update({
        where: {
          id: request.clientRequirementId,
        },
        data: {
          status: RequirementStatus.PENDING,
        },
      });
    }

    return cancelledRequest;
  });
}

export async function deleteDraftClientRequestForUser(
  userId: string,
  clientId: string,
  requestId: string,
) {
  const organizationId =
    await getOrganizationIdForUser(userId);

  const request =
    await prisma.clientRequest.findFirst({
      where: {
        id: requestId,
        clientId,
        client: {
          organizationId,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

  if (!request) {
    throw new Error("REQUEST_NOT_FOUND");
  }

  if (
    request.status !== ClientRequestStatus.DRAFT
  ) {
    throw new Error(
      "ONLY_DRAFT_REQUEST_CAN_BE_DELETED",
    );
  }

  await prisma.clientRequest.delete({
    where: {
      id: request.id,
    },
  });

  return {
    success: true,
  };
}