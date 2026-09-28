"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runDocumentValidation } from "@/services/document-validation.service";
import { getOrganizationForUser } from "@/services/organization.service";

export async function runDocumentValidationAction(
  documentId: string,
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

  const document =
    await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: organization.id,
      },
      select: {
        id: true,
      },
    });

  if (!document) {
    throw new Error("DOCUMENT_NOT_FOUND");
  }

  await runDocumentValidation({
    organizationId: organization.id,
    documentId: document.id,
    userId: session.user.id,
  });

  revalidatePath(
    `/documents/${document.id}`,
  );
  revalidatePath("/documents");
  revalidatePath("/exceptions");

  return {
    success: true,
  };
}