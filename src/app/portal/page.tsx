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
        {/* Welcome + progress */}
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
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
                See what&apos;s needed for your tax
                preparation, submit requested information,
                and keep everything moving forward.
              </p>
            </div>

            <Button
              nativeButton={false}
              render={<Link href="/portal/requests" />}
              className="h-10 w-full rounded-xl px-5 shadow-sm lg:w-auto"
            >
              View my requests
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <div className="border-t bg-slate-50/70 px-5 py-5 sm:px-6 lg:px-7 lg:py-6">
            <div className="grid gap-6 md:grid-cols-[150px_minmax(0,1fr)] md:items-center lg:grid-cols-[170px_minmax(0,1fr)]">
              <ProgressRing progress={progress} />

              <div className="min-w-0">
                <div>
                  <p className="text-base font-semibold text-foreground">
                    Your preparation progress
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Based on your current request status.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <ProgressDetail
                    label="Completed"
                    value={`${completedRequests.length} of ${requests.length}`}
                    success
                  />

                  <ProgressDetail
                    label="Under review"
                    value={String(submittedRequests.length)}
                  />

                  <ProgressDetail
                    label="Actions remaining"
                    value={String(pendingRequests.length)}
                    attention={pendingRequests.length > 0}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Summary */}
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
            description="Under review"
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
          {/* Actions */}
          <Card className="min-w-0 overflow-hidden shadow-sm">
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
                  response right now. New requests will
                  appear here when action is needed.
                </p>
              </CardContent>
            ) : (
              <div className="divide-y">
                {pendingRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="group flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="size-[18px]" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/portal/requests/${request.id}`}
                        className="truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        {request.subject}
                      </Link>

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

                    <Button
                      nativeButton={false}
                      size="sm"
                      render={
                        <Link
                          href={`/portal/requests/${request.id}`}
                        />
                      }
                      className="h-9 w-full shrink-0 rounded-lg px-4 shadow-sm sm:w-auto"
                    >
                      Respond
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
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
            <Card className="overflow-hidden shadow-sm">
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
                      render={
                        <Link
                          href={`/portal/requests/${upcomingRequest.id}`}
                        />
                      }
                      className="mt-5 h-9 w-full rounded-lg shadow-sm"
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

            <Card className="overflow-hidden shadow-sm">
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
                  label="Account"
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
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">
                    Recently submitted
                  </CardTitle>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Items you&apos;ve submitted and are
                    currently being reviewed.
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
                    className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50/80"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileCheck2 className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                        {request.subject}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Submitted for review
                      </p>
                    </div>

                    <span className="hidden rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary sm:inline-flex">
                      Submitted
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <CardContent className="flex flex-col items-center py-10 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <UploadCloud className="size-5" />
                </span>

                <p className="mt-3 text-sm font-semibold text-foreground">
                  No items currently under review
                </p>

                <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                  Submitted requests will appear here while
                  they&apos;re being reviewed.
                </p>
              </CardContent>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}

type ProgressRingProps = {
  progress: number;
};

function ProgressRing({
  progress,
}: ProgressRingProps) {
  const normalizedProgress = Math.min(
    100,
    Math.max(0, progress),
  );

  return (
    <div className="flex justify-center md:justify-start">
      <div
        className="relative flex size-[138px] items-center justify-center rounded-full lg:size-[150px]"
        style={{
          background: `conic-gradient(hsl(var(--primary)) ${normalizedProgress * 3.6}deg, hsl(var(--muted)) 0deg)`,
        }}
        role="progressbar"
        aria-label="Preparation progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalizedProgress}
      >
        <div className="absolute inset-[11px] rounded-full bg-white" />

        <div className="relative z-10 text-center">
          <p className="text-3xl font-semibold tracking-[-0.04em] tabular-nums text-foreground lg:text-4xl">
            {normalizedProgress}%
          </p>

          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            preparation complete
          </p>
        </div>
      </div>
    </div>
  );
}

type ProgressDetailProps = {
  label: string;
  value: string;
  success?: boolean;
  attention?: boolean;
};

function ProgressDetail({
  label,
  value,
  success = false,
  attention = false,
}: ProgressDetailProps) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <span
          className={[
            "size-2 rounded-full",
            attention
              ? "bg-amber-500"
              : success
                ? "bg-emerald-500"
                : "bg-primary",
          ].join(" ")}
        />

        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>
      </div>

      <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
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
    <Card className="min-w-0 shadow-sm transition-shadow hover:shadow-md">
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