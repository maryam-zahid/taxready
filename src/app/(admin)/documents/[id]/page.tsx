import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

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

import { DocumentReviewForm } from "./document-review-form";
import { RunValidationButton } from "./run-validation-button";
import { RunExtractionButton } from "./run-extraction-button";


type DocumentDetailPageProps = {
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

function formatFileSize(bytes: number) {
  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ValidationCheck({
  label,
  status,
  detail,
}: {
  label: string;
  status: string;
  detail?: string;
}) {
  const icon =
    status === "PASSED" ? (
      <CheckCircle2 className="size-5 text-emerald-600" />
    ) : status === "FAILED" ? (
      <XCircle className="size-5 text-destructive" />
    ) : (
      <CircleHelp className="size-5 text-muted-foreground" />
    );

  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium">
            {label}
          </p>

          {detail ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {detail}
            </p>
          ) : null}
        </div>
      </div>

      <StatusBadge
        tone={
          status === "PASSED"
            ? "success"
            : status === "FAILED"
              ? "danger"
              : "neutral"
        }
      >
        {humanize(status)}
      </StatusBadge>
    </div>
  );
}

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const organization =
    await getOrganizationForUser(
      session.user.id,
    );

  if (!organization) {
    redirect("/onboarding/firm");
  }

  const document =
    await prisma.document.findFirst({
      where: {
        id,
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
        reviewedAt: true,
        reviewNote: true,

        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
          },
        },

        clientRequirement: {
          select: {
            taxYear: true,

            requirementDefinition: {
              select: {
                title: true,
                description: true,
                category: true,
              },
            },
          },
        },

        extraction: {
  select: {
    status: true,
    extractorVersion: true,
    errorMessage: true,
    completedAt: true,
    fields: {
      select: {
        id: true,
        key: true,
        label: true,
        type: true,
        textValue: true,
        numericValue: true,
        sourceText: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    },
  },
},

        validation: {
          select: {
            status: true,
            fileTypeCheck: true,
            fileSizeCheck: true,
            requirementCheck: true,
            taxYearCheck: true,
            expectedTaxYear: true,
            detectedTaxYear: true,
            summary: true,
            validatedAt: true,
          },
        },

      },
    });

if (!document) {
  notFound();
}

const requirement =
  document.clientRequirement
    ?.requirementDefinition;

const extraction = document.extraction;
const validation = document.validation;

return (
    <div className="space-y-6">
      <div>
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link href="/documents" />
          }
        >
          <ArrowLeft className="size-4" />
          Back to Documents
        </Button>
      </div>

      <PageHeader
        title={document.fileName}
        description={
          requirement?.title ??
          "Review the submitted client document."
        }
      />

      <div className="grid gap-6 desktop:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>
                  Document information
                </CardTitle>

                <StatusBadge
                  tone={
                    document.status ===
                    "APPROVED"
                      ? "success"
                      : document.status ===
                          "REJECTED"
                        ? "danger"
                        : document.status ===
                            "NEEDS_REVIEW"
                          ? "warning"
                          : "info"
                  }
                >
                  {humanize(
                    document.status,
                  )}
                </StatusBadge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 size-5 text-primary" />

                <div>
                  <p className="font-medium">
                    {document.fileName}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {document.mimeType} ·{" "}
                    {formatFileSize(
                      document.sizeBytes,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-5 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    {getClientName(
                      document.client,
                    )}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {document.client.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-5 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    Uploaded
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(
                      document.uploadedAt,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {document.source ===
                  "CLIENT_PORTAL"
                    ? "Client portal"
                    : "Admin"}
                </Badge>

                {requirement?.category ? (
                  <Badge variant="outline">
                    {humanize(
                      requirement.category,
                    )}
                  </Badge>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3 border-t pt-5">
                <Button
                  nativeButton={false}
                  render={
                    <a
                      href={`/api/documents/${document.id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <ExternalLink className="size-4" />
                  View PDF
                </Button>

                <Button
                  nativeButton={false}
                  render={
                    <a
                      href={`/api/documents/${document.id}/file?download=1`}
                    />
                  }
                >
                  <Download className="size-4" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
<Card>
  <CardHeader>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <FileSearch className="size-5 text-primary" />

        <CardTitle>
          Extracted data
        </CardTitle>
      </div>

      {extraction ? (
        <StatusBadge
          tone={
            extraction.status === "COMPLETED"
              ? "success"
              : extraction.status ===
                  "NEEDS_REVIEW"
                ? "warning"
                : extraction.status ===
                    "FAILED"
                  ? "danger"
                  : "info"
          }
        >
          {humanize(extraction.status)}
        </StatusBadge>
      ) : null}
    </div>
  </CardHeader>

  <CardContent>
    {extraction ? (
      <div className="space-y-5">
        {extraction.fields.length > 0 ? (
          <div className="divide-y rounded-lg border">
            {extraction.fields.map((field) => {
              const isMoney =
                field.type === "MONEY" &&
                field.numericValue !== null;

              const displayValue = isMoney
                ? new Intl.NumberFormat("en-PK", {
                    style: "currency",
                    currency: "PKR",
                    maximumFractionDigits: 2,
                  }).format(
                    Number(field.numericValue),
                  )
                : field.textValue ??
                  (field.numericValue !== null
                    ? String(
                        field.numericValue,
                      )
                    : "—");

              return (
                <div
                  key={field.id}
                  className="grid gap-1 px-4 py-3 tablet:grid-cols-[180px_minmax(0,1fr)] tablet:gap-4"
                >
                  <p className="text-sm text-muted-foreground">
                    {field.label}
                  </p>

                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium">
                      {displayValue}
                    </p>

                    {field.sourceText ? (
                      <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                        Source:{" "}
                        {field.sourceText}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {extraction.errorMessage ??
                "No supported structured fields were identified in this document."}
            </p>
          </div>
        )}

        {extraction.errorMessage &&
        extraction.fields.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {extraction.errorMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
          <div className="text-xs text-muted-foreground">
            {extraction.completedAt
              ? `Last extracted ${formatDate(
                  extraction.completedAt,
                )}`
              : "Extraction is not complete."}
          </div>

          <RunExtractionButton
            documentId={document.id}
            hasExtraction
          />
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Extract structured information from
            this PDF before performing
            content-based validation. Scanned
            documents may require OCR.
          </p>
        </div>

        <RunExtractionButton
          documentId={document.id}
          hasExtraction={false}
        />
      </div>
    )}
  </CardContent>
</Card>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />

                  <CardTitle>
                    Validation results
                  </CardTitle>
                </div>

                {validation ? (
                  <StatusBadge
                    tone={
                      validation.status ===
                      "PASSED"
                        ? "success"
                        : validation.status ===
                            "NEEDS_REVIEW"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {humanize(
                      validation.status,
                    )}
                  </StatusBadge>
                ) : null}
              </div>
            </CardHeader>

            <CardContent>
              {validation ? (
                <div>
                  <ValidationCheck
                    label="PDF file type"
                    status={
                      validation.fileTypeCheck
                    }
                    detail="Checks that the uploaded document is a PDF."
                  />

                  <ValidationCheck
                    label="File size"
                    status={
                      validation.fileSizeCheck
                    }
                    detail="Checks that the document is within the 10 MB upload limit."
                  />

                  <ValidationCheck
                    label="Requirement linkage"
                    status={
                      validation.requirementCheck
                    }
                    detail="Checks that this document is linked to the requested compliance requirement."
                  />

                  <ValidationCheck
                    label="Tax year"
                    status={
                      validation.taxYearCheck
                    }
                    detail={
                      validation.detectedTaxYear !==
                      null
                        ? `Expected ${validation.expectedTaxYear ?? "—"} · Detected ${validation.detectedTaxYear}`
                        : `Expected ${validation.expectedTaxYear ?? "—"} · Content verification pending extraction`
                    }
                  />

                  {validation.summary ? (
                    <div className="mt-4 rounded-lg border bg-muted/30 p-4">
                      <p className="text-sm leading-6 text-muted-foreground">
                        {
                          validation.summary
                        }
                      </p>
                    </div>
                  ) : null}

                  {validation.validatedAt ? (
                    <p className="mt-4 text-xs text-muted-foreground">
                      Last validated{" "}
                      {formatDate(
                        validation.validatedAt,
                      )}
                    </p>
                  ) : null}

                  <div className="mt-5">
                    <RunValidationButton
                      documentId={
                        document.id
                      }
                      hasValidation
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm leading-6 text-muted-foreground">
                    This document has not been
                    validated yet.
                  </p>

                  <RunValidationButton
                    documentId={document.id}
                    hasValidation={false}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Requirement
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="font-medium">
                {requirement?.title ??
                  "Client document"}
              </p>

              {requirement?.description ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {
                    requirement.description
                  }
                </p>
              ) : null}

              {document.clientRequirement
                ?.taxYear ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Tax year:{" "}
                  {
                    document
                      .clientRequirement
                      .taxYear
                  }
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>
              Review document
            </CardTitle>
          </CardHeader>

          <CardContent>
            <DocumentReviewForm
              documentId={document.id}
              initialNote={
                document.reviewNote
              }
            />

            {document.reviewedAt ? (
              <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">
                Last reviewed{" "}
                {formatDate(
                  document.reviewedAt,
                )}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}