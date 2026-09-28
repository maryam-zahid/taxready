"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UpdateProfileInput = {
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
};

export async function updateProfileAction(
  input: UpdateProfileInput,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be signed in to update your profile.",
    };
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const phone = input.phone.trim();
  const jobTitle = input.jobTitle.trim();

  if (!firstName) {
    return {
      success: false,
      message: "First name is required.",
    };
  }

  if (!lastName) {
    return {
      success: false,
      message: "Last name is required.",
    };
  }

  if (firstName.length > 80 || lastName.length > 80) {
    return {
      success: false,
      message: "Name is too long.",
    };
  }

  if (phone.length > 30) {
    return {
      success: false,
      message: "Phone number is too long.",
    };
  }

  if (jobTitle.length > 100) {
    return {
      success: false,
      message: "Job title is too long.",
    };
  }

  try {
    await prisma.$transaction([
      prisma.adminProfile.upsert({
        where: {
          userId: session.user.id,
        },
        update: {
          firstName,
          lastName,
          phone: phone || null,
          jobTitle: jobTitle || null,
        },
        create: {
          userId: session.user.id,
          firstName,
          lastName,
          phone: phone || null,
          jobTitle: jobTitle || null,
        },
      }),

      prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name: `${firstName} ${lastName}`.trim(),
        },
      }),
    ]);

    revalidatePath("/profile");

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    console.error("Failed to update profile:", error);

    return {
      success: false,
      message: "Unable to update your profile. Please try again.",
    };
  }
}