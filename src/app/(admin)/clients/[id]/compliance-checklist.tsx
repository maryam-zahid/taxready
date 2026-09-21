import {
  CheckCircle2,
  Circle,
  CircleAlert,
  FileText,
  Info,
} from "lucide-react";

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
  requirements: Requirement[];
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
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

function RequirementIcon({
  status,
}: {
  status: RequirementStatus;
}) {
  if (status === "COMPLETED") {
    return (
      <CheckCircle2 className="size-[18px] text-success" />
    );
  }

  if (
    status === "NEEDS_REVIEW" ||
    status === "NOT_AVAILABLE"
  ) {
    return (
      <CircleAlert className="size-[18px] text-warning" />
    );
  }

  if (
    status === "SUBMITTED" ||
    status === "REQUESTED"
  ) {
    return (
      <FileText className="size-[18px] text-primary" />
    );
  }

  return (
    <Circle className="size-[18px] text-muted-foreground" />
  );
}

export function ComplianceChecklist({
  requirements,
}: ComplianceChecklistProps) {
  if (requirements.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center px-5 py-8">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <FileText className="size-[18px]" />
          </div>

          <p className="mt-3 text-sm font-medium">
            No compliance checklist yet
          </p>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Complete the client&apos;s tax
            profile, then generate requirements
            for this tax year.
          </p>
        </div>
      </div>
    );
  }

  const completedCount =
    requirements.filter(
      (requirement) =>
        requirement.status === "COMPLETED",
    ).length;

  return (
    <div>
      <div className="flex flex-col gap-2 border-b bg-muted/25 px-4 py-3 tablet:flex-row tablet:items-center tablet:justify-between tablet:px-5">
        <p className="text-xs font-medium text-muted-foreground">
          {requirements.length}{" "}
          {requirements.length === 1
            ? "requirement"
            : "requirements"}
        </p>

        <p className="text-xs text-muted-foreground">
          {completedCount} completed
        </p>
      </div>

      <div className="divide-y">
        {requirements.map(
          (requirement) => {
            const definition =
              requirement.requirementDefinition;

            return (
              <div
                key={requirement.id}
                className="px-4 py-4 transition-colors duration-150 hover:bg-muted/25 tablet:px-5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70">
                    <RequirementIcon
                      status={
                        requirement.status
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 min-[560px]:flex-row min-[560px]:items-start min-[560px]:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-foreground">
                          {definition.title}
                        </h3>

                        {definition.description ? (
                          <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">
                            {
                              definition.description
                            }
                          </p>
                        ) : null}
                      </div>

                      <StatusBadge
                        tone={getStatusTone(
                          requirement.status,
                        )}
                        className="w-fit shrink-0"
                      >
                        {formatLabel(
                          requirement.status,
                        )}
                      </StatusBadge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span>
                        {formatLabel(
                          definition.category,
                        )}
                      </span>

                      <span
                        aria-hidden="true"
                        className="size-1 rounded-full bg-border"
                      />

                      <span>
                        {formatLabel(
                          definition.responseType,
                        )}
                      </span>

                      <span
                        aria-hidden="true"
                        className="size-1 rounded-full bg-border"
                      />

                      <span>
                        {requirement.required
                          ? "Required"
                          : "Optional"}
                      </span>

                      <span
                        aria-hidden="true"
                        className="size-1 rounded-full bg-border"
                      />

                      <span className="inline-flex items-center gap-1">
                        <Info className="size-3" />

                        {requirement.source ===
                        "PROFILE_RULE"
                          ? "Profile generated"
                          : "Manual"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}