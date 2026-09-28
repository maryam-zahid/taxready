"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { AuditAction } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { createAuditLog } from "@/services/audit-log.service";
import { getOrganizationForUser } from "@/services/organization.service";
import { markClientTaxReady } from "@/services/readiness.service";

export async function markClientTaxReadyAction(
  clientId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const organization =
    await getOrganizationForUser(
      session.user.id,
    );

  if (!organization) {
    throw new Error(
      "ORGANIZATION_NOT_FOUND",
    );
  }

  await markClientTaxReady({
    organizationId: organization.id,
    clientId,
    userId: session.user.id,
  });

  await createAuditLog({
    organizationId: organization.id,
    clientId,
    userId: session.user.id,
    action: AuditAction.CLIENT_MARKED_TAX_READY,
    description: "Client marked as tax ready.",
    entityType: "CLIENT",
    entityId: clientId,
  });

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");
  revalidatePath("/dashboard");
  revalidatePath("/audit-log");

  return {
    success: true,
  };
}