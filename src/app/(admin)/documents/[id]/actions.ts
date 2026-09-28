"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createNotification } from "@/services/notification.service";
import {
  ClientRequestStatus,
  DocumentStatus,
  RequirementStatus,
} from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrganizationForUser } from "@/services/organization.service";
import {
  createDocumentReviewException,
  resolveDocumentReviewExceptions,
} from "@/services/exception.service";

import { AuditAction } from "@/generated/prisma/client";
import { createAuditLog } from "@/services/audit-log.service";
type ReviewStatus =
  | "APPROVED"
  | "NEEDS_REVIEW"
  | "REJECTED";

type ReviewDocumentInput = {
  documentId: string;
  status: ReviewStatus;
  reviewNote?: string;
};

export async function reviewDocumentAction(
  input: ReviewDocumentInput,
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
      id: input.documentId,
      organizationId: organization.id,
    },

    select: {
      id: true,
      clientId: true,
      clientRequestId: true,
      clientRequirementId: true,
      fileName: true,
    },
  });

  if (!document) {
    throw new Error("DOCUMENT_NOT_FOUND");
  }

  const reviewNote =
    input.reviewNote?.trim() || null;

  if (
    (input.status === "NEEDS_REVIEW" ||
      input.status === "REJECTED") &&
    !reviewNote
  ) {
    throw new Error("REVIEW_NOTE_REQUIRED");
  }

  const requirementStatus =
    input.status === "APPROVED"
      ? RequirementStatus.COMPLETED
      : RequirementStatus.NEEDS_REVIEW;

  await prisma.$transaction(async (tx) => {
    /*
     * Preserve the reviewed document as audit evidence.
     * A rejected document is never overwritten or deleted
     * when the client is asked to submit a correction.
     */
    await tx.document.update({
      where: {
        id: document.id,
      },

      data: {
        status: DocumentStatus[input.status],
        reviewNote,
        reviewedAt: new Date(),
      },
    });

    if (document.clientRequirementId) {
      await tx.clientRequirement.update({
        where: {
          id: document.clientRequirementId,
        },

        data: {
          status: requirementStatus,
        },
      });
    }

    if (document.clientRequestId) {
      if (input.status === "APPROVED") {
        /*
         * Practitioner approval completes the client request.
         */
        await tx.clientRequest.update({
          where: {
            id: document.clientRequestId,
          },

          data: {
            status:
              ClientRequestStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      }

      if (input.status === "REJECTED") {
        /*
         * A rejected document means the practitioner needs
         * corrected evidence from the client.
         *
         * Reopen the existing request instead of creating a
         * second requirement/request. The old document remains
         * preserved for review and audit history.
         */
        await tx.clientRequest.update({
          where: {
            id: document.clientRequestId,
          },

          data: {
            status: ClientRequestStatus.SENT,
            submittedAt: null,
            completedAt: null,
          },
        });
      }
    }
  });

  if (input.status === "APPROVED") {
    await resolveDocumentReviewExceptions({
      organizationId: organization.id,
      documentId: document.id,
      resolvedByUserId: session.user.id,
      resolutionNote:
        reviewNote ||
        "Document approved after practitioner review.",
    });
  } else {
    await createDocumentReviewException({
      organizationId: organization.id,
      clientId: document.clientId,
      clientRequirementId:
        document.clientRequirementId,
      documentId: document.id,
      documentFileName: document.fileName,
      reviewNote: reviewNote!,
      createdByUserId: session.user.id,
      rejected: input.status === "REJECTED",
    });
  }
await createNotification({
  organizationId: organization.id,
  clientId: document.clientId,
  audience: "CLIENT",
  type:
    input.status === "APPROVED"
      ? "SUCCESS"
      : "ACTION_REQUIRED",
  title:
    input.status === "APPROVED"
      ? "Document approved"
      : input.status === "REJECTED"
        ? "Correction required"
        : "Document needs review",
  message:
    input.status === "APPROVED"
      ? `${document.fileName} has been approved.`
      : reviewNote ??
        `${document.fileName} requires your attention.`,
  href: document.clientRequestId
    ? `/portal/requests/${document.clientRequestId}`
    : "/portal/requests",
});
const auditAction =
  input.status === "APPROVED"
    ? AuditAction.DOCUMENT_APPROVED
    : input.status === "REJECTED"
      ? AuditAction.DOCUMENT_REJECTED
      : AuditAction.DOCUMENT_NEEDS_REVIEW;

await createAuditLog({
  organizationId: organization.id,
  clientId: document.clientId,
  userId: session.user.id,
  action: auditAction,
  description:
    input.status === "APPROVED"
      ? `Document approved: ${document.fileName}`
      : input.status === "REJECTED"
        ? `Document rejected: ${document.fileName}`
        : `Document needs review: ${document.fileName}`,
  entityType: "DOCUMENT",
  entityId: document.id,
});
  revalidatePath("/documents");
  revalidatePath(`/documents/${document.id}`);
  revalidatePath(
    `/clients/${document.clientId}`,
  );
  revalidatePath("/exceptions");

  /*
   * The rejected-document workflow changes what the client
   * can do with the request, so invalidate portal pages too.
   */
  revalidatePath("/portal");
  revalidatePath("/portal/requests");

  if (document.clientRequestId) {
    revalidatePath(
      `/portal/requests/${document.clientRequestId}`,
    );
  }

  return {
    success: true,
  };
}