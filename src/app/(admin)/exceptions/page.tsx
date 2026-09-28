import {
  AlertTriangle,
  CircleCheck,
  CircleDot,
  ShieldAlert,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/taxready/page-header";
import {
  StatusBadge,
  type StatusTone,
} from "@/components/taxready/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  getExceptionsForOrganization,
} from "@/services/exception.service";
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

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getStatusTone(status: string): StatusTone {
  switch (status) {
    case "RESOLVED":
      return "success";

    case "WAIVED":
      return "neutral";

    case "WAITING_CLIENT":
      return "warning";

    case "UNDER_REVIEW":
      return "info";

    case "OPEN":
    default:
      return "danger";
  }
}

function getSeverityTone(
  severity: string,
): StatusTone {
  switch (severity) {
    case "BLOCKING":
      return "danger";

    case "WARNING":
      return "warning";

    default:
      return "info";
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ExceptionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const organization =
    await getOrganizationForUser(session.user.id);

  if (!organization) {
    redirect("/onboarding/firm");
  }

  const exceptions =
    await getExceptionsForOrganization(
      organization.id,
    );

  const activeExceptions = exceptions.filter(
    (exception) =>
      exception.status !== "RESOLVED" &&
      exception.status !== "WAIVED",
  );

  const blockingExceptions =
    activeExceptions.filter(
      (exception) =>
        exception.severity === "BLOCKING",
    );

  const waitingClient =
    activeExceptions.filter(
      (exception) =>
        exception.status === "WAITING_CLIENT",
    );

  const resolvedExceptions = exceptions.filter(
    (exception) =>
      exception.status === "RESOLVED" ||
      exception.status === "WAIVED",
  );

 return (
    <div className="app-page">
      <PageHeader
        title="Exceptions"
        description="Resolve compliance issues that may prevent clients from becoming tax ready."
      />

<div className="mt-6 grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active exceptions
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <CircleDot className="size-5 text-primary" />

              <p className="text-2xl font-semibold">
                {activeExceptions.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Blocking
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-destructive" />

              <p className="text-2xl font-semibold">
                {blockingExceptions.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Waiting for client
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-primary" />

              <p className="text-2xl font-semibold">
                {waitingClient.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved / waived
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <CircleCheck className="size-5 text-primary" />

              <p className="text-2xl font-semibold">
                {resolvedExceptions.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

    <Card className="mt-6">
  <CardHeader>
    <CardTitle>
      Compliance exception queue
          </CardTitle>
        </CardHeader>

        <CardContent>
          {exceptions.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                <CircleCheck className="size-5 text-muted-foreground" />
              </div>

              <h2 className="font-semibold">
                No exceptions
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Compliance issues identified during
                document review, validation or
                reconciliation will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {exceptions.map((exception) => {
                const requirement =
                  exception.clientRequirement
                    ?.requirementDefinition;

                return (
                  <div
                    key={exception.id}
                    className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 desktop:flex-row desktop:items-center desktop:justify-between"
                  >
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">
                          {exception.title}
                        </p>

                        <StatusBadge
                          tone={getStatusTone(
                            exception.status,
                          )}
                        >
                          {humanize(
                            exception.status,
                          )}
                        </StatusBadge>

                        <StatusBadge
                          tone={getSeverityTone(
                            exception.severity,
                          )}
                        >
                          {humanize(
                            exception.severity,
                          )}
                        </StatusBadge>
                      </div>

                      <p className="line-clamp-2 max-w-3xl text-sm text-muted-foreground">
                        {exception.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {getClientName(
                            exception.client,
                          )}
                        </span>

                        {requirement?.title ? (
                          <span>
                            {requirement.title}
                          </span>
                        ) : null}

                        {exception.document
                          ?.fileName ? (
                          <span>
                            {
                              exception.document
                                .fileName
                            }
                          </span>
                        ) : null}

                        <span>
                          {formatDate(
                            exception.createdAt,
                          )}
                        </span>

                        <Badge variant="outline">
                          {humanize(
                            exception.source,
                          )}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      nativeButton={false}
                      render={
                        <Link
                          href={`/exceptions/${exception.id}`}
                        />
                      }
                    >
                      Review Exception
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}