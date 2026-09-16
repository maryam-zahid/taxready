import { PracticeType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { OrganizationInput } from "@/lib/validations/organization";

export async function getOrganizationForUser(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId,
    },
    include: {
      organization: true,
    },
  });

  return membership?.organization ?? null;
}

export async function saveOrganizationForUser(
  userId: string,
  input: OrganizationInput
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    let organizationName = input.name.trim();

    if (
      input.practiceType === "INDEPENDENT_TAX_PROFESSIONAL" &&
      !organizationName
    ) {
      organizationName = user.name?.trim() || "Independent Practice";
    }

    const organizationData = {
      name: organizationName,
      practiceType: PracticeType[input.practiceType],
      businessEmail: input.businessEmail || null,
      businessPhone: input.businessPhone || null,
      ntn: input.ntn || null,
      country: input.country,
      city: input.city || null,
      address: input.address || null,
      website: input.website || null,
    };

    const existingMembership =
      await tx.organizationMember.findFirst({
        where: {
          userId,
        },
        select: {
          organizationId: true,
        },
      });

    if (existingMembership) {
      return tx.organization.update({
        where: {
          id: existingMembership.organizationId,
        },
        data: organizationData,
      });
    }

    return tx.organization.create({
      data: {
        ...organizationData,
        members: {
          create: {
            userId,
          },
        },
      },
    });
  });
}