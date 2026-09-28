import Link from "next/link";

import { StatusBadge } from "@/components/taxready/status-badge";
import type { DashboardData } from "@/services/dashboard.service";

type ClientReadinessProps = {
  clients: DashboardData["clients"];
};

function getTone(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  if (status === "TAX_READY") {
    return "success";
  }

  if (status === "BLOCKED") {
    return "danger";
  }

  if (status === "READY_FOR_REVIEW") {
    return "warning";
  }

  return "neutral";
}

export function ClientReadiness({
  clients,
}: ClientReadinessProps) {
  if (clients.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center px-5 py-8 text-center">
        <div className="max-w-sm">
          <p className="text-sm font-medium">
            No active clients
          </p>

          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            Add a client to begin tracking tax preparation
            readiness.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {clients.slice(0, 8).map((client) => (
        <Link
          key={client.id}
          href={`/clients/${client.id}`}
          className="block px-4 py-4 transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/20 sm:px-5"
        >
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px] sm:items-start lg:grid-cols-[minmax(0,1fr)_150px_145px] lg:items-center">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <p className="truncate text-sm font-semibold">
                  {client.name}
                </p>

                <span className="text-[11px] text-muted-foreground">
                  {client.type === "BUSINESS"
                    ? "Business"
                    : "Individual"}
                </span>
              </div>

              <p className="mt-1 truncate text-xs text-muted-foreground">
                {client.nextAction}
              </p>

              <div className="mt-3 flex items-center gap-3 lg:hidden">
                <ProgressBar
  percentage={client.percentage}
  status={client.readinessStatus}
/>

                <span className="shrink-0 text-xs font-semibold tabular-nums">
                  {client.percentage}%
                </span>
              </div>
            </div>

            <div className="hidden items-center gap-2.5 lg:flex">
             <ProgressBar
  percentage={client.percentage}
  status={client.readinessStatus}
/>
              <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums">
                {client.percentage}%
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="sm:hidden">
                <span className="text-xs text-muted-foreground">
                  Tax year {client.taxYear}
                </span>
              </div>

              <StatusBadge
                tone={getTone(client.readinessStatus)}
              >
                {client.readinessLabel}
              </StatusBadge>
            </div>
          </div>
        </Link>
      ))}

      {clients.length > 8 ? (
        <div className="px-4 py-3 sm:px-5">
          <Link
            href="/clients"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all {clients.length} clients
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function ProgressBar({
  percentage,
  status,
}: {
  percentage: number;
  status: string;
}) {
  const progressColor =
    status === "TAX_READY"
      ? "bg-emerald-600"
      : status === "BLOCKED"
        ? "bg-red-600"
        : status === "READY_FOR_REVIEW"
          ? "bg-blue-600"
          : "bg-amber-500";

  return (
    <div
      className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      aria-label={`${percentage}% complete`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${progressColor}`}
        style={{
          width: `${Math.min(
            100,
            Math.max(0, percentage),
          )}%`,
        }}
      />
    </div>
  );
}