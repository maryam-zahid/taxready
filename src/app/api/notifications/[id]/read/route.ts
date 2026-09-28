import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientPortalContext } from "@/services/client-portal.service";
import { getOrganizationForUser } from "@/services/organization.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    return NextResponse.json(
      { error: "NOTIFICATION_NOT_FOUND" },
      { status: 404 },
    );
  }

  const organization =
    await getOrganizationForUser(session.user.id);

  let authorized = false;

  if (
    organization &&
    notification.audience === "ADMIN" &&
    notification.organizationId === organization.id
  ) {
    authorized = true;
  }

  if (!authorized && notification.audience === "CLIENT") {
    try {
      const portal = await getClientPortalContext(
        session.user.id,
      );

      authorized =
        notification.clientId === portal.clientId;
    } catch {
      authorized = false;
    }
  }

  if (!authorized) {
    return NextResponse.json(
      { error: "FORBIDDEN" },
      { status: 403 },
    );
  }

  if (!notification.readAt) {
    await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}