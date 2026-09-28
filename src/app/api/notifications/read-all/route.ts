import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientPortalContext } from "@/services/client-portal.service";
import { getOrganizationForUser } from "@/services/organization.service";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  const organization =
    await getOrganizationForUser(session.user.id);

  if (organization) {
    await prisma.notification.updateMany({
      where: {
        organizationId: organization.id,
        audience: "ADMIN",
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  }

  try {
    const portal = await getClientPortalContext(
      session.user.id,
    );

    await prisma.notification.updateMany({
      where: {
        clientId: portal.clientId,
        audience: "CLIENT",
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "FORBIDDEN" },
      { status: 403 },
    );
  }
}