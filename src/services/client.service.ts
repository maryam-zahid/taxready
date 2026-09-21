import {
  BusinessEntityType,
  ClientType,
  IndividualTaxpayerType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ClientInput } from "@/lib/validations/client";

async function getOrganizationIdForUser(
  userId: string
) {
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

export async function getClientsForUser(
  userId: string
) {
  const organizationId =
    await getOrganizationIdForUser(userId);

  return prisma.client.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getClientForUser(
  userId: string,
  clientId: string
) {
  const organizationId =
    await getOrganizationIdForUser(userId);

  return prisma.client.findFirst({
    where: {
      id: clientId,
      organizationId,
    },
    include: {
      taxProfile: {
        select: {
          id: true,
        },
      },
    },
  });
}
export async function createClientForUser(
  userId: string,
  input: ClientInput
) {
  const organizationId =
    await getOrganizationIdForUser(userId);

  const normalizedEmail = input.email
    .trim()
    .toLowerCase();

  const existingClient =
    await prisma.client.findFirst({
      where: {
        organizationId,
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

  if (existingClient) {
    throw new Error("CLIENT_EMAIL_EXISTS");
  }

  const preparationDeadline =
    input.preparationDeadline
      ? new Date(
          `${input.preparationDeadline}T00:00:00.000Z`
        )
      : null;

  if (
    preparationDeadline &&
    Number.isNaN(preparationDeadline.getTime())
  ) {
    throw new Error(
      "INVALID_PREPARATION_DEADLINE"
    );
  }

  const isIndividual =
    input.type === "INDIVIDUAL";

  return prisma.client.create({
    data: {
      organizationId,

      type: ClientType[input.type],

      firstName: isIndividual
        ? input.firstName
        : null,

      lastName: isIndividual
        ? input.lastName
        : null,

      businessName: isIndividual
        ? null
        : input.businessName,

      contactPerson: isIndividual
        ? null
        : input.contactPerson,

      email: normalizedEmail,

      phone: input.phone || null,

      ntn: input.ntn || null,

      taxpayerType:
        isIndividual && input.taxpayerType
          ? IndividualTaxpayerType[
              input.taxpayerType
            ]
          : null,

      entityType:
        !isIndividual && input.entityType
          ? BusinessEntityType[
              input.entityType
            ]
          : null,

      occupation:
        isIndividual && input.occupation
          ? input.occupation
          : null,

      businessActivity:
        !isIndividual &&
        input.businessActivity
          ? input.businessActivity
          : null,

      taxYear: input.taxYear,

      preparationDeadline,

      sendPortalInvitation:
        input.sendPortalInvitation,
    },
  });
}