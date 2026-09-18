import { createHash, randomBytes } from "crypto";

import {
  ClientInvitationStatus,
  ClientPortalAccessStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createClientInvitationSchema } from "@/lib/validations/client-invitation";

const INVITATION_EXPIRY_DAYS = 7;

function hashInvitationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createInvitationToken() {
  return randomBytes(32).toString("hex");
}

function getInvitationExpiryDate() {
  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + INVITATION_EXPIRY_DAYS,
  );

  return expiresAt;
}

async function getOrganizationIdForUser(userId: string) {
  const membership =
    await prisma.organizationMember.findFirst({
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

export async function createClientInvitationForUser(
  userId: string,
  clientId: string,
) {
  const input = createClientInvitationSchema.parse({
    clientId,
  });

  const organizationId =
    await getOrganizationIdForUser(userId);

  const client = await prisma.client.findFirst({
    where: {
      id: input.clientId,
      organizationId,
    },
    select: {
      id: true,
      email: true,
      portalAccess: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!client) {
    throw new Error("CLIENT_NOT_FOUND");
  }

  const email = client.email?.trim().toLowerCase();

  if (!email) {
    throw new Error("CLIENT_EMAIL_REQUIRED");
  }

  if (
    client.portalAccess?.status ===
    ClientPortalAccessStatus.ACTIVE
  ) {
    throw new Error("PORTAL_ALREADY_ACTIVE");
  }

  const rawToken = createInvitationToken();
  const tokenHash = hashInvitationToken(rawToken);

  const now = new Date();
  const expiresAt = getInvitationExpiryDate();

  const invitation = await prisma.$transaction(
    async (tx) => {
      await tx.clientInvitation.updateMany({
        where: {
          clientId: client.id,
          status: ClientInvitationStatus.PENDING,
        },
        data: {
          status: ClientInvitationStatus.REVOKED,
          revokedAt: now,
        },
      });

      const portalAccess =
        await tx.clientPortalAccess.upsert({
          where: {
            clientId: client.id,
          },
          create: {
            clientId: client.id,
            status: ClientPortalAccessStatus.INVITED,
            invitedAt: now,
          },
          update: {
            status: ClientPortalAccessStatus.INVITED,
            invitedAt: now,
            disabledAt: null,
          },
        });

      const createdInvitation =
        await tx.clientInvitation.create({
          data: {
            clientId: client.id,
            email,
            tokenHash,
            status: ClientInvitationStatus.PENDING,
            sentAt: now,
            expiresAt,
          },
        });

      return {
        invitation: createdInvitation,
        portalAccess,
      };
    },
  );

  return {
    invitation: invitation.invitation,
    portalAccess: invitation.portalAccess,

    // Raw token is intentionally returned only here.
    // It is never persisted in the database.
    token: rawToken,
  };
}

export async function getClientPortalAccessForUser(
  userId: string,
  clientId: string,
) {
  const organizationId =
    await getOrganizationIdForUser(userId);

  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      organizationId,
    },
    select: {
      id: true,
      email: true,
      portalAccess: true,
      invitations: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          email: true,
          status: true,
          sentAt: true,
          expiresAt: true,
          acceptedAt: true,
          revokedAt: true,
        },
      },
    },
  });

  if (!client) {
    throw new Error("CLIENT_NOT_FOUND");
  }

  const latestInvitation =
    client.invitations[0] ?? null;

  if (
    latestInvitation?.status ===
      ClientInvitationStatus.PENDING &&
    latestInvitation.expiresAt <= new Date()
  ) {
    await prisma.clientInvitation.update({
      where: {
        id: latestInvitation.id,
      },
      data: {
        status: ClientInvitationStatus.EXPIRED,
      },
    });

    latestInvitation.status =
      ClientInvitationStatus.EXPIRED;
  }

  return {
    email: client.email,
    portalAccess: client.portalAccess,
    latestInvitation,
  };
}

export async function revokeClientInvitationForUser(
  userId: string,
  invitationId: string,
) {
  const organizationId =
    await getOrganizationIdForUser(userId);

  const invitation =
    await prisma.clientInvitation.findFirst({
      where: {
        id: invitationId,
        client: {
          organizationId,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            portalAccess: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

  if (!invitation) {
    throw new Error("INVITATION_NOT_FOUND");
  }

  if (
    invitation.status !==
    ClientInvitationStatus.PENDING
  ) {
    throw new Error("INVITATION_NOT_PENDING");
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.clientInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: ClientInvitationStatus.REVOKED,
        revokedAt: now,
      },
    });

    if (
      invitation.client.portalAccess?.status ===
      ClientPortalAccessStatus.INVITED
    ) {
      await tx.clientPortalAccess.update({
        where: {
          clientId: invitation.client.id,
        },
        data: {
          status:
            ClientPortalAccessStatus.NOT_INVITED,
          invitedAt: null,
        },
      });
    }
  });

  return {
    success: true,
  };
}
export async function getClientInvitationByToken(
  token: string,
) {
  if (!token || token.length < 32) {
    throw new Error("INVALID_INVITATION");
  }

  const tokenHash = hashInvitationToken(token);

  const invitation =
    await prisma.clientInvitation.findUnique({
      where: {
        tokenHash,
      },
      select: {
        id: true,
        email: true,
        status: true,
        expiresAt: true,
        client: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            businessName: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

  if (!invitation) {
    throw new Error("INVITATION_NOT_FOUND");
  }

  if (
    invitation.status !==
    ClientInvitationStatus.PENDING
  ) {
    throw new Error("INVITATION_NOT_ACTIVE");
  }

  if (invitation.expiresAt <= new Date()) {
    await prisma.clientInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: ClientInvitationStatus.EXPIRED,
      },
    });

    throw new Error("INVITATION_EXPIRED");
  }

  const clientName =
    invitation.client.type === "BUSINESS"
      ? invitation.client.businessName
      : [
          invitation.client.firstName,
          invitation.client.lastName,
        ]
          .filter(Boolean)
          .join(" ");

  return {
    invitationId: invitation.id,
    clientId: invitation.client.id,
    email: invitation.email,
    clientName: clientName || "Client",
    practiceName:
      invitation.client.organization.name,
    expiresAt: invitation.expiresAt,
  };
} 
export async function activateClientPortalForUser(
  userId: string,
  token: string,
) {
  if (!token || token.length < 32) {
    throw new Error("INVALID_INVITATION");
  }

  const tokenHash = hashInvitationToken(token);
  const now = new Date();

  const invitation =
    await prisma.clientInvitation.findUnique({
      where: {
        tokenHash,
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            portalAccess: true,
          },
        },
      },
    });

  if (!invitation) {
    throw new Error("INVITATION_NOT_FOUND");
  }

  if (
    invitation.status !==
    ClientInvitationStatus.PENDING
  ) {
    throw new Error("INVITATION_NOT_ACTIVE");
  }

  if (invitation.expiresAt <= now) {
    await prisma.clientInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: ClientInvitationStatus.EXPIRED,
      },
    });

    throw new Error("INVITATION_EXPIRED");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (
    user.email.trim().toLowerCase() !==
    invitation.email.trim().toLowerCase()
  ) {
    throw new Error("INVITATION_EMAIL_MISMATCH");
  }

  if (
    invitation.client.email?.trim().toLowerCase() !==
    invitation.email.trim().toLowerCase()
  ) {
    throw new Error("CLIENT_EMAIL_MISMATCH");
  }

  const existingPortalForUser =
    await prisma.clientPortalAccess.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        clientId: true,
      },
    });

  if (
    existingPortalForUser &&
    existingPortalForUser.clientId !==
      invitation.client.id
  ) {
    throw new Error(
      "USER_ALREADY_LINKED_TO_ANOTHER_CLIENT",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.clientInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: ClientInvitationStatus.ACCEPTED,
        acceptedAt: now,
      },
    });

    await tx.clientPortalAccess.upsert({
      where: {
        clientId: invitation.client.id,
      },
      create: {
        clientId: invitation.client.id,
        userId: user.id,
        status: ClientPortalAccessStatus.ACTIVE,
        invitedAt: invitation.sentAt,
        activatedAt: now,
        disabledAt: null,
      },
      update: {
        userId: user.id,
        status: ClientPortalAccessStatus.ACTIVE,
        activatedAt: now,
        disabledAt: null,
      },
    });

    await tx.clientInvitation.updateMany({
      where: {
        clientId: invitation.client.id,
        id: {
          not: invitation.id,
        },
        status: ClientInvitationStatus.PENDING,
      },
      data: {
        status: ClientInvitationStatus.REVOKED,
        revokedAt: now,
      },
    });
  });

  return {
    success: true,
    clientId: invitation.client.id,
  };
}