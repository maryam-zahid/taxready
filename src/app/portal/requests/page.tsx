import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileCheck2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  getClientPortalContext,
  getClientPortalRequests,
} from "@/services/client-portal.service";

function formatDate(date: Date | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getStatusLabel(status: string) {
  switch (status) {
    case "SENT":
      return "Action required";
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

function getStatusClassName(status: string) {
  switch (status) {
    case "SENT":
    case "VIEWED":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "SUBMITTED":
      return "border-primary/20 bg-primary/10 text-primary";
    case "COMPLETED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function getResponseTypeLabel(responseType: string) {
  switch (responseType) {
    case "DOCUMENT":
      return "Document required";
    case "INFORMATION":
      return "Information required";
    case "DOCUMENT_OR_INFORMATION":
      return "Document or information required";
    default:
      return responseType;
  }
}

export default async function PortalRequestsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  let portalAccess;

  try {
    portalAccess = await getClientPortalContext(
      session.user.id,
    );
  } catch {
    redirect("/login");
  }

  const requests = await getClientPortalRequests(
    session.user.id,
  );

  const clientName =
    portalAccess.client.type === "BUSINESS"
      ? portalAccess.client.businessName
      : [
          portalAccess.client.firstName,
          portalAccess.client.lastName,
        ]
          .filter(Boolean)
          .join(" ");

  const actionRequired = requests.filter(
    (request) =>
      request.status === "SENT" ||
      request.status === "VIEWED",
  ).length;

  const submitted = requests.filter(
    (request) => request.status === "SUBMITTED",
  ).length;

  const completed = requests.filter(
    (request) => request.status === "COMPLETED",
  ).length;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/portal" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Button>

        <header className="mt-6 border-b pb-6">
          <p className="text-sm font-semibold text-primary">
            TaxReady Client Portal
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
  Tax preparation requests
</h1>

<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
  Manage requests from your tax practice, submit supporting
  documents and track the status of your responses.
</p>

          <p className="mt-3 text-xs text-muted-foreground">
            {clientName || "Client"} · Tax year{" "}
            {portalAccess.client.taxYear}
          </p>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Total requests"
            value={requests.length}
            icon={ClipboardList}
          />

          <SummaryCard
            label="Action required"
            value={actionRequired}
            icon={Clock3}
          />

          <SummaryCard
            label="Submitted"
            value={submitted}
            icon={FileCheck2}
          />

          <SummaryCard
            label="Completed"
            value={completed}
            icon={CheckCircle2}
          />
        </section>

        <section className="mt-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-base">
                All requests
              </CardTitle>

              <p className="text-sm leading-6 text-muted-foreground">
                Open a request to see your practice&apos;s
                instructions and respond.
              </p>
            </CardHeader>

            {requests.length === 0 ? (
              <CardContent className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ClipboardList className="size-5" />
                </span>

                <h2 className="mt-4 text-sm font-semibold text-foreground">
                  No requests yet
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Requests from your tax practice will
                  appear here when they are sent to you.
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/portal" />}
                  className="mt-5"
                >
                  Back to dashboard
                </Button>
              </CardContent>
            ) : (
              <div className="divide-y">
                {requests.map((request) => {
                  const definition =
                    request.clientRequirement
                      .requirementDefinition;

                  const needsAction =
                    request.status === "SENT" ||
                    request.status === "VIEWED";

                  const actionLabel =
                    request.status === "COMPLETED"
                      ? "View request"
                      : request.status === "SUBMITTED"
                        ? "View submission"
                        : "Respond";

                  return (
                    <Link
                      key={request.id}
                      href={`/portal/requests/${request.id}`}
                      className="group block px-4 py-5 transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 sm:px-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(request.status)}`}
                          >
                            {getStatusLabel(request.status)}
                          </span>

                          <h2 className="mt-3 text-base font-semibold text-foreground">
                            {definition.title}
                          </h2>

                          {definition.description ? (
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                              {definition.description}
                            </p>
                          ) : null}

                          <p className="mt-2 text-xs text-muted-foreground">
                            {getResponseTypeLabel(
                              definition.responseType,
                            )}
                          </p>

                          {request.message ? (
                            <div className="mt-4 rounded-lg border bg-muted/25 p-3">
                              <p className="text-xs font-semibold text-foreground">
                                Message from your practice
                              </p>

                              <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                                {request.message}
                              </p>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                          {request.dueAt ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CalendarDays className="size-3.5" />
                              Due {formatDate(request.dueAt)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No deadline
                            </span>
                          )}

            <span className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors group-hover:bg-primary/90">
  {actionLabel}
  <ArrowRight className="size-4" />
</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  icon: typeof ClipboardList;
};

function SummaryCard({
  label,
  value,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>

          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        </div>

        <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-3xl">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}