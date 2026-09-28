import { ClientRequestStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/services/email.service";

type ReminderKind = "PENDING" | "DUE_SOON" | "OVERDUE";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getClientName(client: {
  type: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
}) {
  if (client.type === "BUSINESS") {
    return client.businessName?.trim() || "Client";
  }

  return (
    [client.firstName, client.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Client"
  );
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getDifferenceInDays(date: Date, now: Date) {
  const target = startOfDay(date).getTime();
  const today = startOfDay(now).getTime();

  return Math.round(
    (target - today) / (1000 * 60 * 60 * 24),
  );
}

function getReminderKind(
  dueAt: Date | null,
  now: Date,
): ReminderKind {
  if (!dueAt) {
    return "PENDING";
  }

  const daysUntilDue = getDifferenceInDays(dueAt, now);

  if (daysUntilDue < 0) {
    return "OVERDUE";
  }

  if (daysUntilDue <= 3) {
    return "DUE_SOON";
  }

  return "PENDING";
}

function getReminderDayKey(now: Date) {
  return now.toISOString().slice(0, 10);
}

function getReminderMarker(
  requestId: string,
  kind: ReminderKind,
  now: Date,
) {
  return `EMAIL_REMINDER:${requestId}:${kind}:${getReminderDayKey(now)}`;
}

function formatDate(date: Date | null) {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getSubject(
  kind: ReminderKind,
  requestSubject: string,
) {
  if (kind === "OVERDUE") {
    return `Overdue: ${requestSubject}`;
  }

  if (kind === "DUE_SOON") {
    return `Due soon: ${requestSubject}`;
  }

  return `Reminder: ${requestSubject}`;
}

export async function sendClientRequestReminders(input?: {
  organizationId?: string;
}) {
      const now = new Date();

  const requests = await prisma.clientRequest.findMany({
    where: {
  status: {
    in: [
      ClientRequestStatus.SENT,
      ClientRequestStatus.VIEWED,
    ],
  },

  ...(input?.organizationId
    ? {
        client: {
          organizationId: input.organizationId,
        },
      }
    : {}),
},
    select: {
      id: true,
      subject: true,
      message: true,
      dueAt: true,
      sentAt: true,

      client: {
        select: {
          id: true,
          organizationId: true,
          type: true,
          firstName: true,
          lastName: true,
          businessName: true,
          email: true,

          organization: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      dueAt: "asc",
    },
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  const results: Array<{
    requestId: string;
    status: "sent" | "skipped" | "failed";
    reason?: string;
  }> = [];

  for (const request of requests) {
    const email = request.client.email?.trim();

    if (!email) {
      skipped++;

      results.push({
        requestId: request.id,
        status: "skipped",
        reason: "CLIENT_EMAIL_MISSING",
      });

      continue;
    }

    const kind = getReminderKind(request.dueAt, now);

    /*
     * For ordinary pending requests, wait at least 3 days
     * after the request was sent before sending a reminder.
     */
    if (kind === "PENDING" && request.sentAt) {
      const ageInDays = Math.floor(
        (now.getTime() - request.sentAt.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (ageInDays < 3) {
        skipped++;

        results.push({
          requestId: request.id,
          status: "skipped",
          reason: "TOO_EARLY_FOR_PENDING_REMINDER",
        });

        continue;
      }
    }

    const marker = getReminderMarker(
      request.id,
      kind,
      now,
    );

    /*
     * Notification record doubles as a lightweight
     * reminder-delivery log for the MVP.
     *
     * This prevents the same reminder from being sent
     * repeatedly on the same day.
     */
    const existingReminder =
      await prisma.notification.findFirst({
        where: {
          clientId: request.client.id,
          audience: "CLIENT",
          message: {
            contains: marker,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingReminder) {
      skipped++;

      results.push({
        requestId: request.id,
        status: "skipped",
        reason: "ALREADY_SENT_TODAY",
      });

      continue;
    }

    const clientName = getClientName(request.client);
    const practiceName =
      request.client.organization.name || "TaxReady";

    const portalUrl = `${
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000"
    }/portal/requests/${request.id}`;

    const safeClientName = escapeHtml(clientName);
    const safePracticeName = escapeHtml(practiceName);
    const safeSubject = escapeHtml(request.subject);
    const safeDueDate = escapeHtml(
      formatDate(request.dueAt),
    );

    let heading = "Document request reminder";
    let intro =
      "You still have an outstanding tax information request.";

    if (kind === "DUE_SOON") {
      heading = "Request due soon";
      intro =
        "One of your outstanding tax requests is approaching its due date.";
    }

    if (kind === "OVERDUE") {
      heading = "Request overdue";
      intro =
        "One of your tax information requests is now overdue.";
    }

    try {
      await sendEmail({
        to: email,
        subject: getSubject(kind, request.subject),
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#111827;line-height:1.6">
            <h2 style="color:#2563eb;margin-bottom:8px">
              ${heading}
            </h2>

            <p>Hello ${safeClientName},</p>

            <p>${intro}</p>

            <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin:20px 0">
              <p style="margin:0 0 8px">
                <strong>Request:</strong>
                ${safeSubject}
              </p>

              <p style="margin:0">
                <strong>Due date:</strong>
                ${safeDueDate}
              </p>
            </div>

            <p>
              Please open your TaxReady portal to provide
              the requested information or document.
            </p>

            <p style="margin:24px 0">
              <a
                href="${portalUrl}"
                style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600"
              >
                Open request
              </a>
            </p>

            <p style="color:#6b7280;font-size:13px">
              Sent by ${safePracticeName} through TaxReady.
            </p>
          </div>
        `,
      });

      /*
       * Store successful reminder only AFTER email succeeds.
       */
      await prisma.notification.create({
        data: {
          organizationId:
            request.client.organizationId,
          clientId: request.client.id,
          audience: "CLIENT",
          type:
            kind === "OVERDUE"
              ? "WARNING"
              : "INFO",
          title:
            kind === "OVERDUE"
              ? "Request overdue"
              : kind === "DUE_SOON"
                ? "Request due soon"
                : "Request reminder",
          message: `${request.subject} · ${marker}`,
          href: `/portal/requests/${request.id}`,
        },
      });

      sent++;

      results.push({
        requestId: request.id,
        status: "sent",
      });
    } catch (error) {
      console.error(
        `Reminder failed for request ${request.id}:`,
        error,
      );

      failed++;

      results.push({
        requestId: request.id,
        status: "failed",
        reason:
          error instanceof Error
            ? error.message
            : "UNKNOWN_ERROR",
      });
    }
  }

  return {
    checked: requests.length,
    sent,
    skipped,
    failed,
    results,
  };
}