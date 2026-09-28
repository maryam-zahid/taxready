import { prisma } from "@/lib/prisma";

import { getClientPortalContext } from "@/services/client-portal.service";

type SubmitInformationResponseInput = {
  requestId: string;
  informationText: string;
};

export async function submitInformationResponseForUser(
  userId: string,
  input: SubmitInformationResponseInput,
) {
  const informationText =
    input.informationText.trim();

  if (!informationText) {
    throw new Error("INFORMATION_REQUIRED");
  }

  const portalAccess =
    await getClientPortalContext(userId);

  const request =
    await prisma.clientRequest.findFirst({
      where: {
        id: input.requestId,
        clientId: portalAccess.clientId,
      },
      include: {
        clientRequirement: {
        include: {
  requirementDefinition: true,

  requests: {
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
    select: {
      id: true,
      status: true,
      subject: true,
      dueAt: true,
      createdAt: true,

      responses: {
        where: {
          status: "SUBMITTED",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          informationText: true,
          submittedAt: true,
        },
      },
    },
  },

  documents: {
    orderBy: {
      uploadedAt: "desc",
    },
    take: 1,
    select: {
      id: true,
      fileName: true,
      status: true,
      uploadedAt: true,
    },
  },
},
        },
      },
    });

  if (!request) {
    throw new Error("CLIENT_REQUEST_NOT_FOUND");
  }

  if (
    request.status !== "SENT" &&
    request.status !== "VIEWED"
  ) {
    throw new Error("REQUEST_NOT_OPEN");
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

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const response = await tx.clientResponse.create({
      data: {
        clientRequestId: request.id,
        status: "SUBMITTED",
        informationText,
        submittedAt: now,
      },
    });

    await tx.clientRequest.update({
      where: {
        id: request.id,
      },
      data: {
        status: "SUBMITTED",
        submittedAt: now,
      },
    });

    await tx.clientRequirement.update({
      where: {
        id: request.clientRequirement.id,
      },
      data: {
        status: "SUBMITTED",
        clientNote: informationText,
      },
    });

    return response;
  });
}

type MarkRequirementNotAvailableInput = {
  requestId: string;
  reason: string;
};

export async function markRequirementNotAvailableForUser(
  userId: string,
  input: MarkRequirementNotAvailableInput,
) {
  const reason = input.reason.trim();

  if (!reason) {
    throw new Error(
      "NOT_AVAILABLE_REASON_REQUIRED",
    );
  }

  const portalAccess =
    await getClientPortalContext(userId);

  const request =
    await prisma.clientRequest.findFirst({
      where: {
        id: input.requestId,
        clientId: portalAccess.clientId,
      },
      include: {
        clientRequirement: true,
      },
    });

  if (!request) {
    throw new Error("CLIENT_REQUEST_NOT_FOUND");
  }

  if (
    request.status !== "SENT" &&
    request.status !== "VIEWED"
  ) {
    throw new Error("REQUEST_NOT_OPEN");
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    await tx.clientRequirement.update({
      where: {
        id: request.clientRequirement.id,
      },
      data: {
        status: "NOT_AVAILABLE",
        clientNote: reason,
      },
    });

    await tx.clientRequest.update({
      where: {
        id: request.id,
      },
      data: {
        status: "SUBMITTED",
        submittedAt: now,
      },
    });

    return {
      success: true,
    };
  });
}