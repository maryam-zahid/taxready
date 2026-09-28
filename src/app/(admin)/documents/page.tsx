import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Search,
} from "lucide-react";

import { PageHeader } from "@/components/taxready/page-header";
import { StatusBadge } from "@/components/taxready/status-badge";
import { Badge } from "@/components/ui/badge";
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

  return [client.firstName, client.lastName]
    .filter(Boolean)
    .join(" ") || "Unnamed client";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function DocumentsPage() {
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

  const documents = await prisma.document.findMany({
    where: {
      organizationId: organization.id,
    },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      status: true,
      source: true,
      uploadedAt: true,
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
            },
          },
        },
      },
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  const pendingReview = documents.filter(
    (document) =>
      document.status === "UPLOADED" ||
      document.status === "NEEDS_REVIEW",
  ).length;

  const approved = documents.filter(
    (document) => document.status === "APPROVED",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Review documents submitted by your clients."
      />

      <div className="grid gap-4 tablet:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total documents
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-primary" />
              <p className="text-2xl font-semibold">
                {documents.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending review
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <Clock3 className="size-5 text-primary" />
              <p className="text-2xl font-semibold">
                {pendingReview}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-primary" />
              <p className="text-2xl font-semibold">
                {approved}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client documents</CardTitle>
        </CardHeader>

        <CardContent>
          {documents.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                <FileText className="size-5 text-muted-foreground" />
              </div>

              <h2 className="font-semibold">
                No documents yet
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Documents uploaded by clients will appear here
                for review.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {documents.map((document) => {
                const requirementTitle =
                  document.clientRequirement
                    ?.requirementDefinition.title ??
                  "Client document";

                return (
                  <div
                    key={document.id}
                    className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 tablet:flex-row tablet:items-center tablet:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">
                          {document.fileName}
                        </p>

                       <StatusBadge
  tone={
    document.status === "APPROVED"
      ? "success"
      : document.status === "REJECTED"
        ? "danger"
        : document.status === "NEEDS_REVIEW"
          ? "warning"
          : "info"
  }
>
  {document.status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    )}
</StatusBadge>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {requirementTitle}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          {getClientName(document.client)}
                        </span>

                        <span>
                          {formatFileSize(
                            document.sizeBytes,
                          )}
                        </span>

                        <span>
                          {formatDate(
                            document.uploadedAt,
                          )}
                        </span>

                        <Badge variant="outline">
                          {document.source ===
                          "CLIENT_PORTAL"
                            ? "Client portal"
                            : "Admin"}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      nativeButton={false}
                      render={
                        <Link
                          href={`/documents/${document.id}`}
                        />
                      }
                    >
                      <Search className="size-4" />
                      Review
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