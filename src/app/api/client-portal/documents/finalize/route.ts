import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { AuditAction } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/services/audit-log.service";
import { prepareDocumentUploadForUser } from "@/services/document-upload.service";
import { finalizeClientDocumentUpload } from "@/services/document.service";
import { createNotification } from "@/services/notification.service";

type FinalizeDocumentBody = {
  requestId?: string;
  fileName?: string;
  storageKey?: string;
  mimeType?: string;
  sizeBytes?: number;
  sha256Hash?: string;
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as FinalizeDocumentBody;

    if (
      !body.requestId ||
      !body.fileName ||
      !body.storageKey ||
      !body.sha256Hash ||
      !Number.isInteger(body.sizeBytes) ||
      !body.sizeBytes
    ) {
      return NextResponse.json(
        {
          error: "INVALID_FINALIZE_PAYLOAD",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Re-authorize the request using the authenticated
     * client instead of trusting client-supplied tenant,
     * client or requirement identifiers.
     */
    const prepared =
      await prepareDocumentUploadForUser(
        session.user.id,
        {
          requestId: body.requestId,
          fileName: body.fileName,
          sha256Hash: body.sha256Hash,
        },
      );

    const document =
      await finalizeClientDocumentUpload({
        userId: session.user.id,
        organizationId:
          prepared.organizationId,
        clientId: prepared.clientId,
        requestId: prepared.requestId,
        requirementId:
          prepared.requirementId,

        fileName: prepared.fileName,
        storageKey: body.storageKey,
        mimeType:
          body.mimeType || "application/pdf",
        sizeBytes: body.sizeBytes,
        sha256Hash: prepared.sha256Hash,
      });

    const client = await prisma.client.findUnique({
      where: {
        id: prepared.clientId,
      },
      select: {
        firstName: true,
        lastName: true,
        businessName: true,
        type: true,
      },
    });

    const clientName =
      client?.type === "BUSINESS"
        ? client.businessName
        : [client?.firstName, client?.lastName]
            .filter(Boolean)
            .join(" ");

    await createNotification({
      organizationId: prepared.organizationId,
      clientId: prepared.clientId,
      audience: "ADMIN",
      type: "ACTION_REQUIRED",
      title: "Document submitted",
      message: `${
        clientName || "Client"
      } uploaded ${document.fileName}.`,
      href: `/documents/${document.id}`,
    });

    await createAuditLog({
      organizationId: prepared.organizationId,
      clientId: prepared.clientId,
      userId: session.user.id,
      action: AuditAction.DOCUMENT_SUBMITTED,
      description: `Document submitted: ${document.fileName}`,
      entityType: "DOCUMENT",
      entityId: document.id,
    });

    return NextResponse.json({
      success: true,
      documentId: document.id,
    });
  } catch (error) {
    console.error(
      "Document finalization failed:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "DOCUMENT_FINALIZATION_FAILED";

    const status =
      message === "UNAUTHORIZED"
        ? 401
        : message === "REQUEST_NOT_FOUND"
          ? 404
          : message === "DUPLICATE_DOCUMENT"
            ? 409
            : 400;

    return NextResponse.json(
      {
        error: message,
      },
      {
        status,
      },
    );
  }
}