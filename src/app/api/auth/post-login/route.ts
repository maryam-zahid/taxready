import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        redirectTo: "/login",
      },
      {
        status: 401,
      },
    );
  }

  const portalAccess = await prisma.clientPortalAccess.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      status: true,
    },
  });

  if (portalAccess?.status === "ACTIVE") {
    return NextResponse.json({
      redirectTo: "/portal",
    });
  }

  return NextResponse.json({
    redirectTo: "/dashboard",
  });
}
