"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  AuditAction,
  ExceptionStatus,
} from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/services/audit-log.service";
import { getOrganizationForUser } from "@/services/organization.service";

type UpdateExceptionInput = {
  exceptionId: string;
  status:
    | "WAITING_CLIENT"
    | "UNDER_REVIEW"
    | "RESOLVED"
    | "WAIVED";
  resolutionNote?: string;
};

export async function updateExceptionAction(
  input: UpdateExceptionInput,
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
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  const exception =
    await prisma.complianceException.findFirst({
      where: {
        id: input.exceptionId,
        organizationId: organization.id,
      },
      select: {
        id: true,
        clientId: true,
        status: true,
      },
    });

  if (!exception) {
    throw new Error("EXCEPTION_NOT_FOUND");
  }

  if (
    exception.status === ExceptionStatus.RESOLVED ||
    exception.status === ExceptionStatus.WAIVED
  ) {
    throw new Error("EXCEPTION_ALREADY_CLOSED");
  }

  const resolutionNote =
    input.resolutionNote?.trim() || null;

  const isClosing =
    input.status === "RESOLVED" ||
    input.status === "WAIVED";

  if (isClosing && !resolutionNote) {
    throw new Error("RESOLUTION_NOTE_REQUIRED");
  }

  await prisma.complianceException.update({
    where: {
      id: exception.id,
    },
    data: {
      status: ExceptionStatus[input.status],

      resolutionNote: isClosing
        ? resolutionNote
        : null,

      resolvedAt: isClosing
        ? new Date()
        : null,

      resolvedByUserId: isClosing
        ? session.user.id
        : null,
    },
  });

  if (isClosing) {
    await createAuditLog({
      organizationId: organization.id,
      clientId: exception.clientId,
      userId: session.user.id,
      action: AuditAction.EXCEPTION_RESOLVED,
      description:
        input.status === "WAIVED"
          ? "Compliance exception waived."
          : "Compliance exception resolved.",
      entityType: "COMPLIANCE_EXCEPTION",
      entityId: exception.id,
    });
  }

  revalidatePath("/exceptions");
  revalidatePath(
    `/exceptions/${exception.id}`,
  );
  revalidatePath(
    `/clients/${exception.clientId}`,
  );
  revalidatePath("/audit-log");

  return {
    success: true,
  };
}