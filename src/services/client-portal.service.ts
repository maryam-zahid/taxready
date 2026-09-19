
import { prisma } from "@/lib/prisma";

export async function getClientPortalContext(
  userId: string,
) {
  const portalAccess =
    await prisma.clientPortalAccess.findUnique({
      where: {
        userId,
      },
      include: {
        client: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
            taxYear: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

  if (!portalAccess) {
    throw new Error("CLIENT_PORTAL_NOT_FOUND");
  }

  if (portalAccess.status !== "ACTIVE") {
    throw new Error("CLIENT_PORTAL_NOT_ACTIVE");
  }

  return portalAccess;
}

export async function getClientPortalRequests(
  userId: string,
) {
  const portalAccess =
    await getClientPortalContext(userId);

  return prisma.clientRequest.findMany({
    where: {
      clientId: portalAccess.clientId,

    status: {
  in: [
    "SENT",
    "VIEWED",
    "SUBMITTED",
    "COMPLETED",
  ],
},
    },

    select: {
      id: true,
      status: true,
      subject: true,
      message: true,
      dueAt: true,
      sentAt: true,
      viewedAt: true,
      submittedAt: true,
      completedAt: true,

     clientRequirement: {
  select: {
    id: true,
    status: true,
    required: true,

    requirementDefinition: {
      select: {
        title: true,
        description: true,
        category: true,
        responseType: true,
      },
    },
  },
},
    },

    orderBy: [
      {
        dueAt: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}
export async function getClientPortalRequestById(
  userId: string,
  requestId: string,
) {
  const portalAccess =
    await getClientPortalContext(userId);

  const request =
    await prisma.clientRequest.findFirst({
      where: {
        id: requestId,

        // Security:
        // request must belong to the client linked
        // with the authenticated portal user.
        clientId: portalAccess.clientId,

        status: {
          in: [
            "SENT",
            "VIEWED",
            "SUBMITTED",
            "COMPLETED",
          ],
        },
      },

      select: {
        id: true,
        status: true,
        subject: true,
        message: true,
        dueAt: true,
        sentAt: true,
        viewedAt: true,
        submittedAt: true,
        completedAt: true,

        clientRequirement: {
          select: {
            id: true,
            status: true,
            required: true,
            clientNote: true,

            requirementDefinition: {
              select: {
                code: true,
                title: true,
                description: true,
                category: true,
                responseType: true,
              },
            },
          },
        },
      },
    });

  if (!request) {
    throw new Error("CLIENT_REQUEST_NOT_FOUND");
  }

  return request;
}