import {
  ClientRequestStatus,
  RequirementResponseType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildClientDocumentPrefix,
  sanitizeDocumentFileName,
} from "@/lib/document-storage";
import { getClientPortalContext } from "@/services/client-portal.service";

const ALLOWED_REQUEST_STATUSES: ClientRequestStatus[] = [
  ClientRequestStatus.SENT,
  ClientRequestStatus.VIEWED,
];

const DOCUMENT_RESPONSE_TYPES: RequirementResponseType[] = [
  RequirementResponseType.DOCUMENT,
  RequirementResponseType.DOCUMENT_OR_INFORMATION,
];

export async function authorizeDocumentUploadForUser(
  userId: string,
  requestId: string,
) {
  const portal = await getClientPortalContext(userId);

  const request = await prisma.clientRequest.findFirst({
    where: {
      id: requestId,
      clientId: portal.clientId,
    },

    select: {
      id: true,
      status: true,

      clientRequirement: {
        select: {
          id: true,

          requirementDefinition: {
            select: {
              responseType: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    throw new Error("REQUEST_NOT_FOUND");
  }

  if (!ALLOWED_REQUEST_STATUSES.includes(request.status)) {
    throw new Error("REQUEST_NOT_UPLOADABLE");
  }

  const responseType =
    request.clientRequirement.requirementDefinition.responseType;

  if (!DOCUMENT_RESPONSE_TYPES.includes(responseType)) {
    throw new Error("REQUEST_DOES_NOT_ACCEPT_DOCUMENTS");
  }

  return {
    organizationId: portal.client.organization.id,
    clientId: portal.clientId,
    requestId: request.id,
    requirementId: request.clientRequirement.id,
    responseType,
  };
}

export async function prepareDocumentUploadForUser(
  userId: string,
  input: {
    requestId: string;
    fileName: string;
    sha256Hash: string;
  },
) {
  const authorization =
    await authorizeDocumentUploadForUser(
      userId,
      input.requestId,
    );

  if (!/^[a-f0-9]{64}$/i.test(input.sha256Hash)) {
    throw new Error("INVALID_DOCUMENT_HASH");
  }

  const duplicate = await prisma.document.findUnique({
    where: {
      clientId_sha256Hash: {
        clientId: authorization.clientId,
        sha256Hash: input.sha256Hash.toLowerCase(),
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicate) {
    throw new Error("DUPLICATE_DOCUMENT");
  }

  const prefix = buildClientDocumentPrefix({
    organizationId: authorization.organizationId,
    clientId: authorization.clientId,
    requestId: authorization.requestId,
  });

  const safeFileName = sanitizeDocumentFileName(
    input.fileName,
  );

  return {
    ...authorization,
    sha256Hash: input.sha256Hash.toLowerCase(),
    fileName: safeFileName,

    pathname:
      `${prefix}/${crypto.randomUUID()}-${safeFileName}`,
  };
}