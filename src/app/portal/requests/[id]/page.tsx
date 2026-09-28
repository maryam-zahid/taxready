import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getClientPortalRequestById } from "@/services/client-portal.service";

import { RequestResponseForm } from "./request-response-form";

type RequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) return "Not specified";

  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date | null) {
  if (!date) return "Not recorded";

  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getStatusLabel(status: string) {
  switch (status) {
    case "SENT":
      return "Needs attention";
    case "VIEWED":
      return "In progress";
    case "SUBMITTED":
      return "Submitted";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

function getResponseTypeLabel(responseType: string) {
  switch (responseType) {
    case "DOCUMENT":
      return "Document required";
    case "INFORMATION":
      return "Information required";
    case "DOCUMENT_OR_INFORMATION":
      return "Document or information";
    default:
      return responseType;
  }
}

function getDocumentStatusLabel(status: string) {
  switch (status) {
    case "UPLOADED":
      return "Uploaded";
    case "NEEDS_REVIEW":
      return "Under review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Correction required";
    default:
      return status;
  }
}

function getDocumentStatusClassName(status: string) {
  switch (status) {
    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "NEEDS_REVIEW":
      return "border-blue-200 bg-blue-50 text-blue-700";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function RequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  let request;

  try {
    request = await getClientPortalRequestById(
      session.user.id,
      id,
    );
  } catch {
    notFound();
  }

  const definition =
    request.clientRequirement.requirementDefinition;

  const isCompleted = request.status === "COMPLETED";
  const isSubmitted = request.status === "SUBMITTED";
  const isReadOnly = isCompleted || isSubmitted;

  const rejectedDocument =
    request.documents.find(
      (document) => document.status === "REJECTED",
    ) ?? null;

  const correctionRequired =
    request.status === "SENT" &&
    request.clientRequirement.status === "NEEDS_REVIEW" &&
    Boolean(rejectedDocument);

  const statusLabel = correctionRequired
    ? "Correction required"
    : getStatusLabel(request.status);

  const submittedResponses = request.responses.filter(
    (response) => Boolean(response.informationText?.trim()),
  );

const currentDocument = request.documents[0] ?? null;
  const notAvailableReason =
    request.clientRequirement.status === "NOT_AVAILABLE"
      ? request.clientRequirement.clientNote
      : null;

  const hasSubmission =
    submittedResponses.length > 0 ||
Boolean(currentDocument) ||
    Boolean(notAvailableReason);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href="/portal/requests"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to requests
      </Link>

      <div className="mt-8 max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <span
            className={[
              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
              correctionRequired
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : isCompleted
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : isSubmitted
                    ? "border-primary/20 bg-primary/5 text-primary"
                    : "border-border bg-muted/50 text-foreground",
            ].join(" ")}
          >
            {statusLabel}
          </span>

          <span className="text-xs text-muted-foreground">
            {getResponseTypeLabel(definition.responseType)}
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {definition.title}
        </h1>

        {definition.description ? (
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            {definition.description}
          </p>
        ) : null}
      </div>

      <div className="mt-8 space-y-6">
        {/* Request details */}
        <section className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold">
              Request details
            </h2>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-foreground">
                  {statusLabel}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">
                  Response type
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-foreground">
                  {getResponseTypeLabel(
                    definition.responseType,
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">
                  Due date
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-foreground">
                  {formatDate(request.dueAt)}
                </dd>
              </div>

              {request.sentAt ? (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Sent by practice
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-foreground">
                    {formatDateTime(request.sentAt)}
                  </dd>
                </div>
              ) : null}

              {request.viewedAt ? (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    First viewed
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-foreground">
                    {formatDateTime(request.viewedAt)}
                  </dd>
                </div>
              ) : null}

              {request.submittedAt ? (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Submitted by you
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-foreground">
                    {formatDateTime(request.submittedAt)}
                  </dd>
                </div>
              ) : null}

              {request.completedAt ? (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Completed by practice
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-foreground">
                    {formatDateTime(request.completedAt)}
                  </dd>
                </div>
              ) : null}
            </dl>

            <p className="mt-6 border-t pt-3 text-xs text-muted-foreground">
              Times shown in Pakistan Standard Time (PKT).
            </p>
          </div>
        </section>

        {/* Your submission */}
        {hasSubmission ? (
          <section className="rounded-xl border bg-card">
            <div className="border-b px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold">
                Your submission
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Documents and information provided for this request.
              </p>
            </div>

            <div className="divide-y px-5 sm:px-6">
         {currentDocument ? (
  <div className="py-5">
    <h3 className="text-sm font-semibold">
      Uploaded document
    </h3>

    <div className="mt-4 rounded-lg border p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="break-all text-sm font-medium text-foreground">
            {currentDocument.fileName}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {formatFileSize(currentDocument.sizeBytes)}
            {" · "}
            Uploaded {formatDateTime(currentDocument.uploadedAt)}
          </p>

          <span
            className={[
              "mt-3 inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium",
              getDocumentStatusClassName(currentDocument.status),
            ].join(" ")}
          >
            {getDocumentStatusLabel(currentDocument.status)}
          </span>
        </div>

        <Button
          nativeButton={false}
          render={
            <a
              href={`/api/client-portal/documents/${currentDocument.id}/file`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
       className="w-full shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
        >
          View document
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  </div>
) : null}
              {submittedResponses.length > 0 ? (
                <div className="py-5">
                  <h3 className="text-sm font-semibold">
                    Submitted information
                  </h3>

                  <div className="mt-4 space-y-3">
                    {submittedResponses.map((response) => (
                      <div
                        key={response.id}
                        className="rounded-lg border p-4"
                      >
                        <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                          {response.informationText}
                        </p>

                        {response.submittedAt ? (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Submitted{" "}
                            {formatDateTime(response.submittedAt)}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {notAvailableReason ? (
                <div className="py-5">
                  <h3 className="text-sm font-semibold">
                    Your response
                  </h3>

                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Marked as not available
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {notAvailableReason}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="border-t px-5 py-3 sm:px-6">
              <p className="text-xs text-muted-foreground">
                Submission times are shown in Pakistan Standard Time
                (PKT).
              </p>
            </div>
          </section>
        ) : null}

        {/* Message from practice */}
        {request.message ? (
          <section className="rounded-xl border bg-card px-5 py-5 sm:px-6">
            <h2 className="text-base font-semibold">
              Message from your practice
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
              {request.message}
            </p>
          </section>
        ) : null}

        {/* Correction details */}
        {correctionRequired && rejectedDocument ? (
          <section className="rounded-xl border border-amber-200 bg-card">
            <div className="border-b border-amber-200 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold">
                Correction required
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your practice needs a corrected document before this
                request can be completed.
              </p>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <p className="text-sm font-medium">
                Practitioner note
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                {rejectedDocument.reviewNote ||
                  "Please provide a corrected document."}
              </p>

              <p className="mt-3 break-all text-xs text-muted-foreground">
                Previous file: {rejectedDocument.fileName}
              </p>
            </div>
          </section>
        ) : null}

        {/* Response / completion */}
        {isReadOnly ? (
          <section className="rounded-xl border bg-card px-5 py-6 sm:px-6">
            <div className="flex items-start gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-4" strokeWidth={2.5} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold">
                  {isCompleted
                    ? "Request completed"
                    : "Response submitted"}
                </h2>

                <p className="mt-1.5 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {isCompleted
                    ? "Your practice has completed the review of this request. No further action is required at this time."
                    : "Your response has been submitted to your practice for review."}
                </p>

                <div className="mt-5">
                  <Button
                    nativeButton={false}
                    render={<Link href="/portal/requests" />}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    View all requests
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-xl border bg-card">
            <div className="border-b px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold">
                {correctionRequired
                  ? "Submit corrected document"
                  : "Complete this request"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {correctionRequired
                  ? "Upload the corrected document requested by your practice."
                  : "Provide the requested document or information below."}
              </p>
            </div>

            <div className="px-5 py-6 sm:px-6">
              <RequestResponseForm
                requestId={request.id}
                responseType={definition.responseType}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}