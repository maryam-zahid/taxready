"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { generateClientRequirementsForUser } from "@/services/compliance-requirement.service";
import {
  createClientRequestForUser,
  sendClientRequestForUser,
} from "@/services/client-request.service";
import {
  createClientInvitationForUser,
  revokeClientInvitationForUser,
} from "@/services/client-invitation.service";

async function getAuthenticatedUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.id;
}

export async function generateComplianceChecklistAction(
  clientId: string,
) {
  const userId = await getAuthenticatedUserId();

  await generateClientRequirementsForUser(userId, clientId);

  revalidatePath(`/clients/${clientId}`);

  return {
    success: true,
  };
}

export async function createClientRequestAction(
  clientId: string,
  clientRequirementId: string,
  subject: string,
  message?: string,
  dueAt?: string,
) {
  const userId = await getAuthenticatedUserId();

  const request = await createClientRequestForUser(
    userId,
    clientId,
    {
      clientRequirementId,
      subject,
      message,
      dueAt: dueAt ? new Date(dueAt) : undefined,
    },
  );

  revalidatePath(`/clients/${clientId}`);

  return {
    success: true,
    requestId: request.id,
  };
}

export async function sendClientRequestAction(
  clientId: string,
  requestId: string,
) {
  const userId = await getAuthenticatedUserId();

  await sendClientRequestForUser(userId, requestId);

  revalidatePath(`/clients/${clientId}`);

  return {
    success: true,
  };
}
export async function sendClientInvitationAction(
  clientId: string,
) {
  const userId = await getAuthenticatedUserId();

  const result = await createClientInvitationForUser(
    userId,
    clientId,
  );

  revalidatePath(`/clients/${clientId}`);

  return {
    success: true,
    invitationId: result.invitation.id,

    // Temporary for local MVP testing only.
    // Once email delivery is connected, raw token will not
    // be returned to the browser.
    token: result.token,
  };
}

export async function revokeClientInvitationAction(
  clientId: string,
  invitationId: string,
) {
  const userId = await getAuthenticatedUserId();

  await revokeClientInvitationForUser(
    userId,
    invitationId,
  );

  revalidatePath(`/clients/${clientId}`);

  return {
    success: true,
  };
}