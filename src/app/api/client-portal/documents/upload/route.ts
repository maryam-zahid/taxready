import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  DOCUMENT_ALLOWED_CONTENT_TYPES,
  DOCUMENT_MAX_SIZE_BYTES,
  sanitizeDocumentFileName,
} from "@/lib/document-storage";
import { finalizeClientDocumentUpload } from "@/services/document.service";
import { prepareDocumentUploadForUser } from "@/services/document-upload.service";

type UploadPayload = {
  requestId: string;
  fileName: string;
  sizeBytes: number;
  sha256Hash: string;
};

type CompletionPayload = {
  userId: string;
  organizationId: string;
  clientId: string;
  requestId: string;
  requirementId: string;

  fileName: string;
  sizeBytes: number;
  sha256Hash: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const result = await handleUpload({
      request,
      body,

      onBeforeGenerateToken: async (
        pathname,
        clientPayload,
      ) => {
        /*
         * Authentication is required when issuing
         * the upload token.
         */
        const session = await auth.api.getSession({
          headers: await headers(),
        });

        if (!session?.user?.id) {
          throw new Error("UNAUTHORIZED");
        }

        if (!clientPayload) {
          throw new Error("UPLOAD_PAYLOAD_REQUIRED");
        }

        let payload: UploadPayload;

        try {
          payload = JSON.parse(
            clientPayload,
          ) as UploadPayload;
        } catch {
          throw new Error("INVALID_UPLOAD_PAYLOAD");
        }

        if (
          !payload.requestId ||
          !payload.fileName ||
          !payload.sha256Hash
        ) {
          throw new Error("INVALID_UPLOAD_PAYLOAD");
        }

        if (
          !Number.isInteger(payload.sizeBytes) ||
          payload.sizeBytes <= 0 ||
          payload.sizeBytes > DOCUMENT_MAX_SIZE_BYTES
        ) {
          throw new Error("INVALID_DOCUMENT_SIZE");
        }

        const expectedPrefix =
          `taxready/client-uploads/${payload.requestId}/`;

        if (!pathname.startsWith(expectedPrefix)) {
          throw new Error("INVALID_DOCUMENT_PATH");
        }

        if (!pathname.toLowerCase().endsWith(".pdf")) {
          throw new Error("PDF_ONLY");
        }

        const prepared =
          await prepareDocumentUploadForUser(
            session.user.id,
            {
              requestId: payload.requestId,
              fileName: payload.fileName,
              sha256Hash: payload.sha256Hash,
            },
          );

        const tokenPayload: CompletionPayload = {
          userId: session.user.id,
          organizationId: prepared.organizationId,
          clientId: prepared.clientId,
          requestId: prepared.requestId,
          requirementId: prepared.requirementId,

          fileName: prepared.fileName,
          sizeBytes: payload.sizeBytes,
          sha256Hash: prepared.sha256Hash,
        };

        return {
          allowedContentTypes: [
            ...DOCUMENT_ALLOWED_CONTENT_TYPES,
          ],

          maximumSizeInBytes:
            DOCUMENT_MAX_SIZE_BYTES,

          addRandomSuffix: false,
          allowOverwrite: false,

          tokenPayload:
            JSON.stringify(tokenPayload),
        };
      },

      onUploadCompleted: async ({
        blob,
        tokenPayload,
      }) => {
        if (!tokenPayload) {
          throw new Error(
            "UPLOAD_COMPLETION_PAYLOAD_REQUIRED",
          );
        }

        const payload = JSON.parse(
          tokenPayload,
        ) as CompletionPayload;

        await finalizeClientDocumentUpload({
          userId: payload.userId,
          organizationId: payload.organizationId,
          clientId: payload.clientId,
          requestId: payload.requestId,
          requirementId: payload.requirementId,

          fileName: payload.fileName,

          /*
           * Blob pathname is our provider-side
           * storage identifier. We deliberately
           * do not store a public URL.
           */
          storageKey: blob.pathname,

          mimeType:
            blob.contentType || "application/pdf",

          sizeBytes: payload.sizeBytes,
          sha256Hash: payload.sha256Hash,
        });
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Client document upload failed:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "DOCUMENT_UPLOAD_FAILED";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          message === "UNAUTHORIZED" ? 401 : 400,
      },
    );
  }
}