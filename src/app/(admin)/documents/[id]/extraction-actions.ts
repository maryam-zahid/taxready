"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runDocumentExtraction } from "@/services/document-extraction.service";
import { runDocumentValidation } from "@/services/document-validation.service";
import { reconcileDocument } from "@/services/reconciliation.service";
import { getOrganizationForUser } from "@/services/organization.service";

export async function runDocumentExtractionAction(
  documentId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const organization = await getOrganizationForUser(
    session.user.id,
  );

  if (!organization) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  const document = await prisma.document.findFirst({
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

  await runDocumentExtraction({
    organizationId: organization.id,
    documentId: document.id,
  });

  /*
   * Re-run deterministic validation after extraction so
   * content-derived values such as tax year participate
   * in the validation result.
   */
  await runDocumentValidation({
  organizationId: organization.id,
  documentId: document.id,
  userId: session.user.id,
});

/*
 * Compare supported extracted monetary values with
 * amounts declared in the client's tax profile.
 *
 * Missing declared/extracted values are treated as
 * NOT_CHECKED rather than mismatches.
 */
await reconcileDocument({
  organizationId: organization.id,
  documentId: document.id,
  performedByUserId: session.user.id,
});

revalidatePath(`/documents/${document.id}`);
  revalidatePath("/documents");
  revalidatePath("/exceptions");

  return {
    success: true,
  };
}