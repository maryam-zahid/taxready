import {
  DocumentSource,
  DocumentStatus,
  RequirementStatus,
  ClientRequestStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type FinalizeClientDocumentInput = {
  userId: string;
  organizationId: string;
  clientId: string;
  requestId: string;
  requirementId: string;

  fileName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
};

export async function finalizeClientDocumentUpload(
  input: FinalizeClientDocumentInput,
) {
  if (
    !Number.isInteger(input.sizeBytes) ||
    input.sizeBytes <= 0 ||
    input.sizeBytes > 10 * 1024 * 1024
  ) {
    throw new Error("INVALID_DOCUMENT_SIZE");
  }

  if (!/^[a-f0-9]{64}$/i.test(input.sha256Hash)) {
    throw new Error("INVALID_DOCUMENT_HASH");
  }

  return prisma.$transaction(async (tx) => {
    /*
     * Re-check workflow state inside the transaction.
     * The upload token may have been issued slightly earlier.
     */
    const request = await tx.clientRequest.findFirst({
      where: {
        id: input.requestId,
        clientId: input.clientId,
        clientRequirementId: input.requirementId,

        status: {
          in: [
            ClientRequestStatus.SENT,
            ClientRequestStatus.VIEWED,
          ],
        },
      },

      select: {
        id: true,
        clientRequirement: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error("REQUEST_NOT_FINALIZABLE");
    }

    const document = await tx.document.create({
      data: {
        organizationId: input.organizationId,
        clientId: input.clientId,
        clientRequestId: input.requestId,
        clientRequirementId: input.requirementId,

        fileName: input.fileName,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        sha256Hash: input.sha256Hash.toLowerCase(),

        status: DocumentStatus.UPLOADED,
        source: DocumentSource.CLIENT_PORTAL,

        uploadedByUserId: input.userId,
      },
    });

    await tx.clientRequest.update({
      where: {
        id: input.requestId,
      },

      data: {
        status: ClientRequestStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    await tx.clientRequirement.update({
      where: {
        id: input.requirementId,
      },

      data: {
        status: RequirementStatus.SUBMITTED,
      },
    });

    return document;
  });
}