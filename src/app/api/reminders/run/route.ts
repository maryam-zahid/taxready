import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendClientRequestReminders } from "@/services/reminder.service";

export async function POST() {
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

    /*
     * MVP security:
     * only a user belonging to a tax practice
     * can manually trigger reminders.
     */
    const membership =
      await prisma.organizationMember.findFirst({
        where: {
          userId: session.user.id,
        },
       select: {
  id: true,
  organizationId: true,
},
      });

    if (!membership) {
      return NextResponse.json(
        {
          error: "FORBIDDEN",
        },
        {
          status: 403,
        },
      );
    }

   const result = await sendClientRequestReminders({
  organizationId: membership.organizationId,
});

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Reminder run failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "REMINDER_RUN_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}