"use server";
import { AuditAction } from "@/generated/prisma/client";
import { createAuditLog } from "@/services/audit-log.service";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getClientPortalContext } from "@/services/client-portal.service";
import { createNotification } from "@/services/notification.service";
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

  const portal = await getClientPortalContext(userId);

  await submitInformationResponseForUser(userId, {
    requestId,
    informationText,
  });

  const request = await prisma.clientRequest.findFirst({
    where: {
      id: requestId,
      clientId: portal.clientId,
    },
    select: {
      subject: true,
    },
  });

  await createNotification({
    organizationId: portal.client.organization.id,
    clientId: portal.clientId,
    audience: "ADMIN",
    type: "ACTION_REQUIRED",
    title: "Client submission received",
    message:
      request?.subject ?? "Client submitted requested information.",
    href: `/clients/${portal.clientId}`,
  });

  await createAuditLog({
  organizationId: portal.client.organization.id,
  clientId: portal.clientId,
  userId,
  action: AuditAction.INFORMATION_SUBMITTED,
  description: `Information submitted: ${
    request?.subject ?? "Client request"
  }`,
  entityType: "CLIENT_REQUEST",
  entityId: requestId,
});

  revalidatePath(`/portal/requests/${requestId}`);
  revalidatePath("/portal/requests");
  revalidatePath("/portal");
  revalidatePath(`/clients/${portal.clientId}`);

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
  const portal = await getClientPortalContext(userId);

await createNotification({
  organizationId: portal.client.organization.id,
  clientId: portal.clientId,
  audience: "ADMIN",
  type: "WARNING",
  title: "Requested information unavailable",
  message: reason,
  href: `/clients/${portal.clientId}`,
});

  revalidatePath(`/portal/requests/${requestId}`);
  revalidatePath("/portal/requests");
  revalidatePath("/portal");

  return {
    success: true,
  };
}