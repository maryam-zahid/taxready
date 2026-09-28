import { NextRequest, NextResponse } from "next/server";

import { sendClientRequestReminders } from "@/services/reminder.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET_MISSING" },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const result = await sendClientRequestReminders();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Automatic reminder cron failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "AUTOMATIC_REMINDER_FAILED",
      },
      { status: 500 }
    );
  }
}