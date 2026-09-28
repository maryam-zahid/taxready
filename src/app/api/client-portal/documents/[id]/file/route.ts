import { get } from "@vercel/blob";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientPortalContext } from "@/services/client-portal.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  let portal: Awaited<
    ReturnType<typeof getClientPortalContext>
  >;

  try {
    portal = await getClientPortalContext(session.user.id);
  } catch {
    return NextResponse.json(
      { error: "Client portal access required" },
      { status: 403 },
    );
  }

  const { id } = await context.params;

  const document = await prisma.document.findFirst({
    where: {
      id,
      clientId: portal.clientId,
      source: "CLIENT_PORTAL",
      clientRequest: {
        clientId: portal.clientId,
      },
    },
    select: {
      fileName: true,
      storageKey: true,
    },
  });

  if (!document) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 },
    );
  }

  try {
    const blob = await get(document.storageKey, {
      access: "private",
    });

    if (!blob) {
      return NextResponse.json(
        { error: "Stored file not found" },
        { status: 404 },
      );
    }

    const disposition =
      request.nextUrl.searchParams.get("download") === "1"
        ? "attachment"
        : "inline";

    const safeFileName = document.fileName.replace(
      /["\r\n]/g,
      "_",
    );

    return new Response(blob.stream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          `${disposition}; filename="${safeFileName}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Failed to retrieve client document:", error);

    return NextResponse.json(
      { error: "Unable to retrieve document" },
      { status: 500 },
    );
  }
}