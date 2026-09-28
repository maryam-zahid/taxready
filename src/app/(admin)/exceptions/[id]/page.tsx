import {
  ArrowLeft,
  FileText,
  UserRound,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

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
import { getExceptionForOrganization } from "@/services/exception.service";
import { getOrganizationForUser } from "@/services/organization.service";

import { ExceptionActions } from "./exception-actions";

type ExceptionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

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
    default:
      return "danger";
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ExceptionDetailPage({
  params,
}: ExceptionDetailPageProps) {
  const { id } = await params;

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

  const exception =
    await getExceptionForOrganization(
      organization.id,
      id,
    );

  if (!exception) {
    notFound();
  }

  const requirement =
    exception.clientRequirement
      ?.requirementDefinition;

  return (
    <div className="app-page">
<div className="mb-5">
            <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/exceptions" />}
        >
          <ArrowLeft className="size-4" />
          Back to Exceptions
        </Button>
      </div>

      <PageHeader
        title={exception.title}
        description="Review and resolve this compliance exception."
      />

<div className="mt-6 grid gap-6 desktop:grid-cols-[minmax(0,1fr)_380px]">        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>
                  Exception details
                </CardTitle>

                <div className="flex flex-wrap gap-2">
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
                    tone={
                      exception.severity ===
                      "BLOCKING"
                        ? "danger"
                        : exception.severity ===
                            "WARNING"
                          ? "warning"
                          : "info"
                    }
                  >
                    {humanize(
                      exception.severity,
                    )}
                  </StatusBadge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-medium">
                  Issue
                </p>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {exception.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {humanize(
                    exception.source,
                  )}
                </Badge>

                {requirement?.category ? (
                  <Badge variant="outline">
                    {humanize(
                      requirement.category,
                    )}
                  </Badge>
                ) : null}
              </div>

              <p className="text-xs text-muted-foreground">
                Created{" "}
                {formatDate(
                  exception.createdAt,
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Client & requirement
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-5 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    {getClientName(
                      exception.client,
                    )}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {exception.client.email}
                  </p>
                </div>
              </div>

              {requirement ? (
                <div>
                  <p className="font-medium">
                    {requirement.title}
                  </p>

                  {requirement.description ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {requirement.description}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {exception.document ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Source document
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="size-5 shrink-0 text-primary" />

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {
                          exception.document
                            .fileName
                        }
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Uploaded{" "}
                        {formatDate(
                          exception.document
                            .uploadedAt,
                        )}
                      </p>
                    </div>
                  </div>

                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={`/documents/${exception.document.id}`}
                      />
                    }
                  >
                    Review Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>
              Exception workflow
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ExceptionActions
              exceptionId={exception.id}
              status={exception.status}
              initialResolutionNote={
                exception.resolutionNote
              }
            />

            {exception.resolvedAt ? (
              <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">
                Closed{" "}
                {formatDate(
                  exception.resolvedAt,
                )}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}