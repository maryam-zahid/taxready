"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { organizationSchema } from "@/lib/validations/organization";
import { saveOrganizationForUser } from "@/services/organization.service";

export type OrganizationActionInput = {
  practiceType:
    | "INDEPENDENT_TAX_PROFESSIONAL"
    | "TAX_ACCOUNTING_FIRM"
    | "OTHER";
  name: string;
  businessEmail: string;
  businessPhone: string;
  ntn: string;
  country: string;
  city: string;
  address: string;
  website: string;
};

export async function saveOrganizationAction(
  input: OrganizationActionInput
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be signed in to set up your practice.",
    };
  }

  const result = organizationSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Please check your practice information.",
    };
  }

  try {
    await saveOrganizationForUser(
      session.user.id,
      result.data
    );

    return {
      success: true,
      message: "Practice setup completed successfully.",
    };
  } catch (error) {
    console.error("Failed to save organization:", error);

    return {
      success: false,
      message:
        "Unable to save your practice details. Please try again.",
    };
  }
}