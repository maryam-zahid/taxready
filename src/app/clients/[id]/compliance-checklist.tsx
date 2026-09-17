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
        word.slice(1)
    )
    .join(" ");
}

export function ComplianceChecklist({
  requirements,
}: ComplianceChecklistProps) {
  if (requirements.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No compliance checklist has been
        generated yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {requirements.map((requirement) => (
        <div
          key={requirement.id}
          className="rounded-md border p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">
                {
                  requirement
                    .requirementDefinition.title
                }
              </h3>

              {requirement
                .requirementDefinition
                .description ? (
                <p className="mt-1 text-sm text-gray-600">
                  {
                    requirement
                      .requirementDefinition
                      .description
                  }
                </p>
              ) : null}
            </div>

            <span className="rounded border px-2 py-1 text-xs">
              {formatLabel(
                requirement.status
              )}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
            <span>
              Category:{" "}
              {formatLabel(
                requirement
                  .requirementDefinition
                  .category
              )}
            </span>

            <span>
              Response:{" "}
              {formatLabel(
                requirement
                  .requirementDefinition
                  .responseType
              )}
            </span>

            <span>
              Source:{" "}
              {formatLabel(
                requirement.source
              )}
            </span>

            <span>
              {requirement.required
                ? "Required"
                : "Optional"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}