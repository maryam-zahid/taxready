import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { activateClientPortalForUser } from "@/services/client-invitation.service";

const activationSchema = z.object({
  token: z.string().min(32),
});

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

    const body = await request.json();

    const input = activationSchema.parse(body);

    await activateClientPortalForUser(
      session.user.id,
      input.token,
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Client portal activation failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "ACTIVATION_FAILED";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      },
    );
  }
}