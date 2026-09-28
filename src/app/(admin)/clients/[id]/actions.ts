"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { AuditAction } from "@/generated/prisma/client";
import { createAuditLog } from "@/services/audit-log.service";
import { auth } from "@/lib/auth";
import { generateClientRequirementsForUser } from "@/services/compliance-requirement.service";
import {
  cancelClientRequestForUser,
  completeSubmittedInformationRequestForUser,
  createClientRequestForUser,
  deleteDraftClientRequestForUser,
  sendClientRequestForUser,
  updateClientRequestForUser,
} from "@/services/client-request.service";
import {
  createClientInvitationForUser,
  revokeClientInvitationForUser,
} from "@/services/client-invitation.service";

import { createNotification } from "@/services/notification.service";
import { getOrganizationForUser } from "@/services/organization.service";
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

  const [request, organization] = await Promise.all([
    sendClientRequestForUser(userId, requestId),
    getOrganizationForUser(userId),
  ]);

  if (!organization) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  await createNotification({
    organizationId: organization.id,
    clientId,
    audience: "CLIENT",
    type: "ACTION_REQUIRED",
    title: "New document request",
    message: request.subject,
    href: `/portal/requests/${request.id}`,
  });

  await createAuditLog({
  organizationId: organization.id,
  clientId,
  userId,
  action: AuditAction.REQUEST_SENT,
  description: `Request sent: ${request.subject}`,
  entityType: "CLIENT_REQUEST",
  entityId: request.id,
});

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/portal");
  revalidatePath("/portal/requests");

  return {
    success: true,
  };
}
export async function completeInformationRequestAction(
  clientId: string,
  requestId: string,
) {
  const userId = await getAuthenticatedUserId();

  await completeSubmittedInformationRequestForUser(
    userId,
    clientId,
    requestId,
  );

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/portal");
  revalidatePath("/portal/requests");
  revalidatePath(`/portal/requests/${requestId}`);

  return {
    success: true,
  };
}
export async function updateClientRequestAction(
  clientId: string,
  requestId: string,
  input: {
    subject: string;
    message?: string;
    dueAt?: string;
  },
) {
  const userId =
    await getAuthenticatedUserId();

  await updateClientRequestForUser(
    userId,
    clientId,
    requestId,
    {
      subject: input.subject,
      message: input.message,
      dueAt: input.dueAt
        ? new Date(`${input.dueAt}T12:00:00`)
        : null,
    },
  );

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/requests");
  revalidatePath("/portal");
  revalidatePath("/portal/requests");
  revalidatePath(
    `/portal/requests/${requestId}`,
  );

  return {
    success: true,
  };
}

export async function cancelClientRequestAction(
  clientId: string,
  requestId: string,
) {
  const userId =
    await getAuthenticatedUserId();

  await cancelClientRequestForUser(
    userId,
    clientId,
    requestId,
  );

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/requests");
  revalidatePath("/portal");
  revalidatePath("/portal/requests");

  return {
    success: true,
  };
}

export async function deleteDraftClientRequestAction(
  clientId: string,
  requestId: string,
) {
  const userId =
    await getAuthenticatedUserId();

  await deleteDraftClientRequestForUser(
    userId,
    clientId,
    requestId,
  );

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/requests");

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