import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  UploadCloud,
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

export default async function ClientPortalPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const portalAccess = await getClientPortalContext(
    session.user.id,
  );

  const requests = await getClientPortalRequests(
    session.user.id,
  );

  const client = portalAccess.client;

  const clientName =
    client.type === "BUSINESS"
      ? client.businessName
      : [client.firstName, client.lastName]
          .filter(Boolean)
          .join(" ");

  const pendingRequests = requests.filter(
    (request) =>
      request.status === "SENT" ||
      request.status === "VIEWED",
  );

  const submittedRequests = requests.filter(
    (request) => request.status === "SUBMITTED",
  );

  const completedRequests = requests.filter(
    (request) => request.status === "COMPLETED",
  );

  const upcomingRequest = [...pendingRequests]
    .filter((request) => request.dueAt)
    .sort(
      (a, b) =>
        new Date(a.dueAt!).getTime() -
        new Date(b.dueAt!).getTime(),
    )[0];

  const resolvedClientName =
    clientName || session.user.name || "Client";

  const firstName =
    resolvedClientName.split(" ")[0] || "Client";

  const finishedRequests =
    submittedRequests.length + completedRequests.length;

  const progress =
    requests.length > 0
      ? Math.round(
          (finishedRequests / requests.length) * 100,
        )
      : 100;

  const recentSubmitted = [...submittedRequests]
    .sort((a, b) => {
      const aTime = a.sentAt
        ? new Date(a.sentAt).getTime()
        : 0;

      const bTime = b.sentAt
        ? new Date(b.sentAt).getTime()
        : 0;

      return bTime - aTime;
    })
    .slice(0, 4);

  return (
    <main className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Welcome */}
        <section className="overflow-hidden rounded-2xl border bg-white">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:p-7">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  Tax year {client.taxYear}
                </span>

                <span className="text-xs text-muted-foreground">
                  {client.organization.name}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-foreground sm:text-3xl">
                Welcome, {firstName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                See what your tax practice needs from you,
                submit requested information, and keep your
                preparation moving forward.
              </p>
            </div>

            <Button
              nativeButton={false}
              render={<Link href="/portal/requests" />}
              className="w-full lg:w-auto"
            >
              View my requests
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <div className="border-t bg-muted/20 px-5 py-4 sm:px-6 lg:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Your preparation progress
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Based on your current request status
                </p>
              </div>

              <p className="text-xl font-semibold tabular-nums text-primary">
                {progress}%
              </p>
            </div>

            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Client-friendly summary */}
        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Action required"
            value={pendingRequests.length}
            description="Waiting for you"
            icon={Clock3}
            attention={pendingRequests.length > 0}
          />

          <SummaryCard
            label="Submitted"
            value={submittedRequests.length}
            description="With your practice"
            icon={UploadCloud}
          />

          <SummaryCard
            label="Completed"
            value={completedRequests.length}
            description="Finished requests"
            icon={CheckCircle2}
            success
          />

          <SummaryCard
            label="Total requests"
            value={requests.length}
            description="For this tax year"
            icon={FileCheck2}
          />
        </section>

        <section className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
          {/* Main actions */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-base">
                    What we need from you
                  </CardTitle>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Complete these items to keep your tax
                    preparation moving.
                  </p>
                </div>

                {pendingRequests.length > 0 ? (
                  <span className="inline-flex w-fit rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {pendingRequests.length}{" "}
                    {pendingRequests.length === 1
                      ? "action"
                      : "actions"}{" "}
                    required
                  </span>
                ) : null}
              </div>
            </CardHeader>

            {pendingRequests.length === 0 ? (
              <CardContent className="flex min-h-[280px] flex-col items-center justify-center px-5 py-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
                  <Check className="size-5" />
                </span>

                <h2 className="mt-4 text-base font-semibold text-foreground">
                  You&apos;re all caught up
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  There&apos;s nothing waiting for your
                  response right now. New requests from your
                  tax practice will appear here.
                </p>
              </CardContent>
            ) : (
              <div className="divide-y">
                {pendingRequests.slice(0, 5).map((request) => (
                  <Link
                    key={request.id}
                    href={`/portal/requests/${request.id}`}
                    className="group flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 sm:flex-row sm:items-center"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="size-[18px]" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {request.subject}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>Action required</span>

                        <span className="hidden size-1 rounded-full bg-muted-foreground/40 sm:block" />

                        <span>
                          {request.dueAt
                            ? `Due ${formatDate(request.dueAt)}`
                            : "No deadline specified"}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
                      Respond
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}

                {pendingRequests.length > 5 ? (
                  <div className="px-5 py-4">
                    <Button
                      nativeButton={false}
                      variant="outline"
                      className="w-full"
                      render={
                        <Link href="/portal/requests" />
                      }
                    >
                      View all outstanding requests
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </Card>

          {/* Right rail */}
          <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <CardTitle className="text-base">
                  Next deadline
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarDays className="size-[18px]" />
                </span>

                {upcomingRequest?.dueAt ? (
                  <>
                    <p className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                      {formatDate(upcomingRequest.dueAt)}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {upcomingRequest.subject}
                    </p>

                    <Button
                      nativeButton={false}
                      size="sm"
                      variant="outline"
                      render={
                        <Link
                          href={`/portal/requests/${upcomingRequest.id}`}
                        />
                      }
                      className="mt-5 w-full"
                    >
                      View request
                      <ArrowRight className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="mt-4 text-sm font-semibold text-foreground">
                      No upcoming deadline
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      You currently have no outstanding
                      request with a deadline.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <CardTitle className="text-base">
                  Preparation details
                </CardTitle>
              </CardHeader>

              <CardContent className="divide-y p-0">
                <DetailItem
                  label="Tax year"
                  value={String(client.taxYear)}
                />

                <DetailItem
                  label="Tax practice"
                  value={client.organization.name}
                />

                <DetailItem
                  label="Your requests"
                  value={`${finishedRequests} of ${requests.length} submitted or completed`}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recently submitted */}
        <section className="mt-5">
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">
                    Recently submitted
                  </CardTitle>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Items you&apos;ve sent to your tax
                    practice for review.
                  </p>
                </div>

                <Button
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                  render={<Link href="/portal/requests" />}
                  className="w-full sm:w-auto"
                >
                  View all requests
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardHeader>

            {recentSubmitted.length > 0 ? (
              <div className="divide-y">
                {recentSubmitted.map((request) => (
                  <Link
                    key={request.id}
                    href={`/portal/requests/${request.id}`}
                    className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/30"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-primary">
                      <FileCheck2 className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {request.subject}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Submitted for practice review
                      </p>
                    </div>

                    <span className="hidden rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-primary sm:inline-flex">
                      Submitted
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <CardContent className="py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  No items currently under review
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Submitted requests will appear here while
                  your practice reviews them.
                </p>
              </CardContent>
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
  description: string;
  icon: typeof Clock3;
  attention?: boolean;
  success?: boolean;
};

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  attention = false,
  success = false,
}: SummaryCardProps) {
  const iconClass = attention
    ? "bg-amber-500/10 text-amber-700"
    : success
      ? "bg-emerald-500/10 text-emerald-700"
      : "bg-primary/10 text-primary";

  return (
    <Card className="min-w-0">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">
              {label}
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-[-0.035em] tabular-nums text-foreground sm:text-3xl">
              {value}
            </p>
          </div>

          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
          >
            <Icon className="size-4" />
          </span>
        </div>

        <p className="mt-2 truncate text-[11px] leading-5 text-muted-foreground sm:text-xs">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}