"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrganizationForUser } from "@/services/organization.service";
import { PracticeType } from "@/generated/prisma/client";
const PRACTICE_TYPES = [
  "INDEPENDENT_TAX_PROFESSIONAL",
  "TAX_ACCOUNTING_FIRM",
  "OTHER",
] as const;

type PracticeTypeValue =
  (typeof PRACTICE_TYPES)[number];
export type UpdatePracticeSettingsInput = {
  name: string;
practiceType: PracticeTypeValue;
  businessEmail: string;
  businessPhone: string;
  ntn: string;
  website: string;
  country: string;
  city: string;
  address: string;
};
export async function updatePracticeSettingsAction(
  input: UpdatePracticeSettingsInput,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be signed in to update practice settings.",
    };
  }

  const organization = await getOrganizationForUser(
    session.user.id,
  );

  if (!organization) {
    return {
      success: false,
      message: "Tax practice not found.",
    };
  }

  const name = input.name.trim();
  const businessEmail = input.businessEmail.trim();
  const businessPhone = input.businessPhone.trim();
  const ntn = input.ntn.trim();
  const website = input.website.trim();
  const country = input.country.trim();
  const city = input.city.trim();
  const address = input.address.trim();

  if (!name) {
    return {
      success: false,
      message: "Practice name is required.",
    };
  }

  if (!country) {
    return {
      success: false,
      message: "Country is required.",
    };
  }
 if (!PRACTICE_TYPES.includes(input.practiceType)) {
  return {
    success: false,
    message: "Select a valid practice type.",
  };
}

  if (
    businessEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)
  ) {
    return {
      success: false,
      message: "Enter a valid business email address.",
    };
  }

  if (name.length > 150) {
    return {
      success: false,
      message: "Practice name is too long.",
    };
  }

  if (
    businessPhone.length > 30 ||
    ntn.length > 50 ||
    country.length > 100 ||
    city.length > 100
  ) {
    return {
      success: false,
      message: "One or more fields are too long.",
    };
  }

  try {
    await prisma.organization.update({
      where: {
        id: organization.id,
      },
      data: {
        name,
        businessEmail: businessEmail || null,
        businessPhone: businessPhone || null,
        ntn: ntn || null,
        website: website || null,
        country,
        practiceType: input.practiceType,
        city: city || null,
        address: address || null,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Practice settings updated successfully.",
    };
  } catch (error) {
    console.error("Failed to update practice settings:", error);

    return {
      success: false,
      message: "Unable to update practice settings. Please try again.",
    };
  }
}