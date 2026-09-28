import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  ClipboardList,
} from "lucide-react";

import { PageHeader } from "@/components/taxready/page-header";
import { StatusBadge } from "@/components/taxready/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrganizationForUser } from "@/services/organization.service";

function getClientName(client: {
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
}) {
  if (client.businessName) {
    return client.businessName;
  }

  return (
    [client.firstName, client.lastName]
      .filter(Boolean)
      .join(" ") || "Unnamed client"
  );
}

function formatDate(date: Date | null) {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(date);
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getStatusTone(status: string) {
  switch (status) {
    case "COMPLETED":
      return "success" as const;

    case "SUBMITTED":
      return "info" as const;

    case "CANCELLED":
      return "danger" as const;

    case "SENT":
    case "VIEWED":
      return "warning" as const;

    default:
      return "neutral" as const;
  }
}

export default async function RequestsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const organization = await getOrganizationForUser(
    session.user.id,
  );

  if (!organization) {
    redirect("/onboarding/firm");
  }

  const requests =
    await prisma.clientRequest.findMany({
      where: {
        client: {
          organizationId: organization.id,
        },
      },
      select: {
        id: true,
        clientId: true,
        subject: true,
        status: true,
        dueAt: true,
        createdAt: true,
        sentAt: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
            businessName: true,
          },
        },
        clientRequirement: {
          select: {
            requirementDefinition: {
              select: {
                title: true,
                responseType: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  const awaitingClient = requests.filter(
    (request) =>
      request.status === "SENT" ||
      request.status === "VIEWED",
  ).length;

  const submitted = requests.filter(
    (request) =>
      request.status === "SUBMITTED",
  ).length;

  const completed = requests.filter(
    (request) =>
      request.status === "COMPLETED",
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
      <div className="space-y-6">
        <PageHeader
          title="Requests"
          description="Track information and document requests sent to your clients."
        />

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <Card className="min-w-0">
            <CardHeader className="px-4 pb-2 pt-4 sm:px-5 sm:pt-5">
              <CardTitle className="text-xs font-medium leading-4 text-muted-foreground sm:text-sm">
                Total requests
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <ClipboardList className="size-[18px] shrink-0 text-primary sm:size-5" />

                <p className="text-xl font-semibold sm:text-2xl">
                  {requests.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="px-4 pb-2 pt-4 sm:px-5 sm:pt-5">
              <CardTitle className="text-xs font-medium leading-4 text-muted-foreground sm:text-sm">
                Awaiting client
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Clock3 className="size-[18px] shrink-0 text-primary sm:size-5" />

                <p className="text-xl font-semibold sm:text-2xl">
                  {awaitingClient}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="px-4 pb-2 pt-4 sm:px-5 sm:pt-5">
              <CardTitle className="text-xs font-medium leading-4 text-muted-foreground sm:text-sm">
                Submitted
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <ClipboardList className="size-[18px] shrink-0 text-primary sm:size-5" />

                <p className="text-xl font-semibold sm:text-2xl">
                  {submitted}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="px-4 pb-2 pt-4 sm:px-5 sm:pt-5">
              <CardTitle className="text-xs font-medium leading-4 text-muted-foreground sm:text-sm">
                Completed
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <CheckCircle2 className="size-[18px] shrink-0 text-primary sm:size-5" />

                <p className="text-xl font-semibold sm:text-2xl">
                  {completed}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests */}
        <Card>
          <CardHeader className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
            <CardTitle className="text-base sm:text-lg">
              Client requests
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5 lg:px-6">
            {requests.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                  <ClipboardList className="size-5 text-muted-foreground" />
                </div>

                <h2 className="font-semibold">
                  No requests yet
                </h2>

                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Requests created for your clients
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {requests.map((request) => {
                  const requirement =
                    request.clientRequirement
                      .requirementDefinition;

                  return (
                    <div
                      key={request.id}
                      className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 tablet:flex-row tablet:items-center tablet:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="break-words text-sm font-medium leading-5 sm:text-base">
                            {request.subject}
                          </p>

                          <StatusBadge
                            tone={getStatusTone(
                              request.status,
                            )}
                          >
                            {formatStatus(
                              request.status,
                            )}
                          </StatusBadge>
                        </div>

                        <p className="mt-1.5 break-words text-sm leading-5 text-muted-foreground">
                          {requirement.title}
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs leading-4 text-muted-foreground">
                          <span>
                            {getClientName(
                              request.client,
                            )}
                          </span>

                          <span className="hidden size-1 rounded-full bg-border min-[420px]:block" />

                          <span>
                            {formatStatus(
                              requirement.responseType,
                            )}
                          </span>

                          <span className="hidden size-1 rounded-full bg-border min-[420px]:block" />

                          <span>
                            Due:{" "}
                            {formatDate(
                              request.dueAt,
                            )}
                          </span>
                        </div>
                      </div>

                      <Button
                        nativeButton={false}
                        className="w-full tablet:w-auto tablet:shrink-0"
                        render={
                          <Link
                            href={`/clients/${request.clientId}`}
                          />
                        }
                      >
                        View client
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}