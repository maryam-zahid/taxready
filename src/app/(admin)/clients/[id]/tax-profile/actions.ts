"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";

import { clientTaxProfileSchema } from "@/lib/validations/client-tax-profile";

import { getOrganizationForUser } from "@/services/organization.service";

import { saveClientTaxProfileForUser } from "@/services/client-tax-profile.service";

import { reconcileWealthMovement } from "@/services/reconciliation.service";

export type SaveTaxProfileActionResult = {
  success: boolean;
  message: string;
};

export async function saveTaxProfileAction(
  clientId: string,
  input: unknown,
): Promise<SaveTaxProfileActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be signed in.",
    };
  }

  const parsed =
    clientTaxProfileSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Enter valid tax profile information.",
    };
  }

  try {
    const organization =
      await getOrganizationForUser(
        session.user.id,
      );

    if (!organization) {
      return {
        success: false,
        message:
          "Your practice setup could not be found.",
      };
    }

    await saveClientTaxProfileForUser(
      session.user.id,
      clientId,
      parsed.data,
    );

    await reconcileWealthMovement({
      organizationId: organization.id,
      clientId,
      performedByUserId:
        session.user.id,
    });

    revalidatePath(
      `/clients/${clientId}`,
    );

    revalidatePath(
      `/clients/${clientId}/tax-profile`,
    );

    revalidatePath("/exceptions");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        "Tax profile saved successfully.",
    };
  } catch (error) {
    console.error(
      "Failed to save tax profile:",
      error,
    );

    if (
      error instanceof Error &&
      error.message === "CLIENT_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "Client could not be found.",
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "ORGANIZATION_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "Your practice setup could not be found.",
      };
    }

    return {
      success: false,
      message:
        "Unable to save tax profile. Please try again.",
    };
  }
}