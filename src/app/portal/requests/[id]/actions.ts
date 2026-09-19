"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  markRequirementNotAvailableForUser,
  submitInformationResponseForUser,
} from "@/services/client-response.service";

async function getPortalUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.id;
}

export async function submitInformationResponseAction(
  requestId: string,
  informationText: string,
) {
  const userId = await getPortalUserId();

  await submitInformationResponseForUser(userId, {
    requestId,
    informationText,
  });

  revalidatePath(`/portal/requests/${requestId}`);
  revalidatePath("/portal/requests");
  revalidatePath("/portal");

  return {
    success: true,
  };
}

export async function markNotAvailableAction(
  requestId: string,
  reason: string,
) {
  const userId = await getPortalUserId();

  await markRequirementNotAvailableForUser(userId, {
    requestId,
    reason,
  });

  revalidatePath(`/portal/requests/${requestId}`);
  revalidatePath("/portal/requests");
  revalidatePath("/portal");

  return {
    success: true,
  };
}