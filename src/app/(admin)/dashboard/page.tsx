import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { ClientReadiness } from "@/components/taxready/dashboard/client-readiness";
import { ReadinessDonut } from "@/components/taxready/dashboard/readiness-donut";
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
import { getDashboardDataForUser } from "@/services/dashboard.service";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dashboard = await getDashboardDataForUser(
    session.user.id,
  );

  const {
    summary,
    readiness,
    clients,
    needsAttention,
  } = dashboard;

  const taxReadyPercentage =
    summary.totalClients === 0
      ? 0
      : Math.round(
          (summary.taxReadyClients /
            summary.totalClients) *
            100,
        );

  const attentionCount =
    summary.blockingExceptions +
    summary.documentsNeedingReview;

  return (
    <div className="app-page">
      <PageHeader
        eyebrow={dashboard.organization.name}
        title="Dashboard"
        description="Practice overview, client readiness and items requiring attention."
        actions={
          <Button
            nativeButton={false}
            render={<Link href="/clients/new" />}
          >
            <Plus className="size-4" />
            Add client
          </Button>
        }
      />
{summary.totalClients === 0 ? (
  <Card className="mt-6 overflow-hidden border-primary/15 bg-primary/[0.03]">
    <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
          Your workspace is ready
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          Add your first client
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Start by creating a client profile. You can then
          track tax preparation progress, request documents
          and manage outstanding items in one place.
        </p>
      </div>

      <Button
        nativeButton={false}
        render={<Link href="/clients/new" />}
        className="w-full shrink-0 sm:w-auto"
      >
        <Plus className="size-4" />
        Add your first client
      </Button>
    </CardContent>
  </Card>
) : null}
      <section className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          label="Total clients"
          value={summary.totalClients}
          detail="Active clients"
        />

        <MetricCard
          label="Tax Ready"
          value={summary.taxReadyClients}
          detail={`${taxReadyPercentage}% of clients`}
        />

        <MetricCard
          label="Open requests"
          value={summary.openRequests}
          detail="Awaiting workflow action"
        />

        <MetricCard
          label="Needs attention"
          value={attentionCount}
          detail="Blocking or review items"
          emphasis={attentionCount > 0}
        />
      </section>

      {summary.totalClients > 0 ? (
        <>
      <section className="mt-5 grid min-w-0 gap-5 desktop:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div>
                <CardTitle>
                  Client readiness
                </CardTitle>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Preparation progress and the next action
                  for each active client.
                </p>
              </div>

             <Button
  size="sm"
  nativeButton={false}
  render={<Link href="/clients" />}
>
  View clients
</Button>
            </div>
          </CardHeader>

          <ClientReadiness clients={clients} />
        </Card>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2 desktop:grid-cols-1">
          <Card className="min-w-0">
            <CardHeader className="border-b">
              <CardTitle>
                Readiness distribution
              </CardTitle>

              <p className="text-sm leading-6 text-muted-foreground">
                Current status across active clients.
              </p>
            </CardHeader>

            <CardContent className="py-6">
              <ReadinessDonut
                total={summary.totalClients}
                taxReady={readiness.taxReady}
                readyForReview={
                  readiness.readyForReview
                }
                inProgress={readiness.inProgress}
                blocked={readiness.blocked}
              />
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="border-b">
              <CardTitle>
                Preparation progress
              </CardTitle>

              <p className="text-sm leading-6 text-muted-foreground">
                Required checklist completion across the
                practice.
              </p>
            </CardHeader>

            <CardContent className="py-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[30px] font-semibold leading-none tracking-[-0.04em]">
                    {summary.overallPreparationPercentage}%
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    requirements completed
                  </p>
                </div>

                <p className="text-right text-xs text-muted-foreground">
                  {summary.completedRequirements} of{" "}
                  {summary.totalRequirements}
                </p>
              </div>

              <div
                className="mt-5 h-2 overflow-hidden rounded-full bg-muted"
                aria-label={`${summary.overallPreparationPercentage}% of requirements completed`}
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${summary.overallPreparationPercentage}%`,
                  }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4">
                <SmallStat
                  label="Completed"
                  value={summary.completedRequirements}
                />

                <SmallStat
                  label="Outstanding"
                  value={Math.max(
                    0,
                    summary.totalRequirements -
                      summary.completedRequirements,
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-5">
        <Card className="overflow-hidden">
       <CardHeader className="border-b">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <CardTitle>
  Needs attention
</CardTitle>

<p className="mt-1 text-sm leading-6 text-muted-foreground">
  Clients with blocking issues, overdue requests or items
  waiting for review.
</p>
    </div>

    <Button
      size="sm"
      nativeButton={false}
      render={<Link href="/clients" />}
      className="w-fit shrink-0"
    >
      View clients
    </Button>
  </div>
</CardHeader>
          {needsAttention.length === 0 ? (
            <CardContent className="flex min-h-36 items-center justify-center p-6 text-center">
              <div className="max-w-sm">
                <p className="text-sm font-medium">
                  Nothing needs immediate attention
                </p>

                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  Blocking and review items will appear
                  here when practitioner action is needed.
                </p>
              </div>
            </CardContent>
          ) : (
            <div className="divide-y">
              {needsAttention.map((item) => (
                <Link
                  key={item.id}
                  href={`/clients/${item.id}`}
                  className="grid gap-2 px-4 py-4 transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/20 sm:grid-cols-[minmax(0,1fr)_minmax(180px,1.2fr)_auto] sm:items-center sm:gap-5 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.name}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                      {item.nextAction}
                    </p>
                  </div>

                  <p className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">
                    {item.nextAction}
                  </p>

                  <AttentionBadge
                    type={item.nextActionType}
                  />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </section>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  emphasis = false,
}: {
  label: string;
  value: number;
  detail: string;
  emphasis?: boolean;
}) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-4 sm:p-5">
        <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
          {label}
        </p>

        <div className="mt-2 flex items-end justify-between gap-2">
          <p
            className={`text-[26px] font-semibold leading-none tracking-[-0.04em] tabular-nums sm:text-[30px] ${
              emphasis ? "text-destructive" : ""
            }`}
          >
            {value}
          </p>
        </div>

        <p className="mt-2 truncate text-[11px] text-muted-foreground sm:text-xs">
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function AttentionBadge({
  type,
}: {
  type: string;
}) {
  if (type === "exception") {
    return (
      <StatusBadge tone="danger">
        Blocking
      </StatusBadge>
    );
  }

  if (type === "overdue") {
    return (
      <StatusBadge tone="danger">
        Overdue
      </StatusBadge>
    );
  }

  if (type === "document") {
    return (
      <StatusBadge tone="warning">
        Review document
      </StatusBadge>
    );
  }

  return (
    <StatusBadge tone="warning">
      Review response
    </StatusBadge>
  );
}