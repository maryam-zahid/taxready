import Link from "next/link";

import { StatusBadge } from "@/components/taxready/status-badge";
import type { StatusTone } from "@/components/taxready/status-badge";
import type {
  RequirementCategory,
  RequirementResponseType,
  RequirementSource,
  RequirementStatus,
} from "@/generated/prisma/client";

type Requirement = {
  id: string;
  status: RequirementStatus;
  source: RequirementSource;
  required: boolean;
  requirementDefinition: {
    title: string;
    description: string | null;
    category: RequirementCategory;
    responseType: RequirementResponseType;
  };
};

type ComplianceChecklistProps = {
  clientId: string;
  requirements: Requirement[];
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function getStatusTone(
  status: RequirementStatus,
): StatusTone {
  switch (status) {
    case "COMPLETED":
      return "success";

    case "SUBMITTED":
    case "REQUESTED":
      return "info";

    case "NEEDS_REVIEW":
    case "NOT_AVAILABLE":
      return "warning";

    case "PENDING":
    case "NOT_APPLICABLE":
    case "WAIVED":
    default:
      return "neutral";
  }
}

function getResponseTypeLabel(
  type: RequirementResponseType,
) {
  switch (type) {
    case "DOCUMENT":
      return "Document";

    case "INFORMATION":
      return "Information";

    case "DOCUMENT_OR_INFORMATION":
      return "Document or information";

    default:
      return formatLabel(type);
  }
}

function RequestClientLink({
  clientId,
  requirementId,
}: {
  clientId: string;
  requirementId: string;
}) {
  return (
    <Link
      href={`/clients/${clientId}?requestRequirement=${encodeURIComponent(
        requirementId,
      )}#client-requests`}
      className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      Request client
    </Link>
  );
}

export function ComplianceChecklist({
  clientId,
  requirements,
}: ComplianceChecklistProps) {
  if (requirements.length === 0) {
    return (
      <div className="flex min-h-52 items-center justify-center px-5 py-8 text-center">
        <div className="max-w-md">
          <p className="text-sm font-semibold">
            No compliance checklist yet
          </p>

          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            Complete the client&apos;s tax profile,
            then generate requirements for this tax
            year.
          </p>
        </div>
      </div>
    );
  }

  const completedCount = requirements.filter(
    (requirement) =>
      requirement.status === "COMPLETED" ||
      requirement.status === "WAIVED",
  ).length;

  return (
    <div>
      {/* Checklist summary */}
      <div className="flex flex-col gap-3 border-b bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">
            {completedCount} of {requirements.length} complete
          </p>

          <span className="text-xs text-muted-foreground">
            {requirements.length} requirements
          </span>
        </div>

        <div className="h-1.5 w-full max-w-44 overflow-hidden rounded-full bg-muted sm:w-36">
          <div
            className="h-full rounded-full bg-emerald-600"
            style={{
              width: `${Math.round(
                (completedCount / requirements.length) * 100,
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Desktop / tablet */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-[minmax(0,1fr)_150px_120px_150px] gap-4 border-b bg-muted/10 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          <span>Requirement</span>
          <span>Response</span>
          <span className="text-right">Status</span>
          <span className="text-right">Action</span>
        </div>

        <div className="divide-y">
          {requirements.map((requirement) => {
            const definition =
              requirement.requirementDefinition;

            return (
              <div
                key={requirement.id}
                className="grid grid-cols-[minmax(0,1fr)_150px_120px_150px] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/20"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {definition.title}
                  </p>

                  {definition.description ? (
                    <p className="mt-1 line-clamp-2 max-w-3xl text-xs leading-5 text-muted-foreground">
                      {definition.description}
                    </p>
                  ) : null}

                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {formatLabel(definition.category)}
                    {" · "}
                    {requirement.required
                      ? "Required"
                      : "Optional"}
                    {" · "}
                    {requirement.source === "PROFILE_RULE"
                      ? "Profile generated"
                      : "Manual"}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  {getResponseTypeLabel(
                    definition.responseType,
                  )}
                </p>

                <div className="flex justify-end">
                  <StatusBadge
                    tone={getStatusTone(
                      requirement.status,
                    )}
                  >
                    {formatLabel(requirement.status)}
                  </StatusBadge>
                </div>

                <div className="flex justify-end">
                  {requirement.status === "PENDING" ? (
                    <RequestClientLink
                      clientId={clientId}
                      requirementId={requirement.id}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      —
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile */}
      <div className="divide-y sm:hidden">
        {requirements.map((requirement) => {
          const definition =
            requirement.requirementDefinition;

          return (
            <div
              key={requirement.id}
              className="px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-sm font-semibold">
                  {definition.title}
                </p>

                <StatusBadge
                  tone={getStatusTone(
                    requirement.status,
                  )}
                  className="shrink-0"
                >
                  {formatLabel(requirement.status)}
                </StatusBadge>
              </div>

              {definition.description ? (
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  {definition.description}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {getResponseTypeLabel(
                    definition.responseType,
                  )}
                </span>

                <span aria-hidden="true">·</span>

                <span>
                  {formatLabel(definition.category)}
                </span>

                <span aria-hidden="true">·</span>

                <span>
                  {requirement.required
                    ? "Required"
                    : "Optional"}
                </span>
              </div>

              {requirement.status === "PENDING" ? (
                <div className="mt-3">
                  <RequestClientLink
                    clientId={clientId}
                    requirementId={requirement.id}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}