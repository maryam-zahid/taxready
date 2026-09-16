import { prisma } from "@/lib/prisma";
import type { AuthProfileInput } from "@/lib/validations/auth-profile";

export async function getAdminProfile(userId: string) {
  return prisma.adminProfile.findUnique({
    where: {
      userId,
    },
  });
}

export async function saveAdminProfile(
  userId: string,
  input: AuthProfileInput
) {
  const fullName = `${input.firstName} ${input.lastName}`.trim();

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        name: fullName,
      },
    });

    return tx.adminProfile.upsert({
      where: {
        userId,
      },
      update: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
      create: {
        userId,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
    });
  });
}