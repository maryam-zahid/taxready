"use client";

import { useState, useTransition } from "react";

import { generateComplianceChecklistAction } from "./actions";

type GenerateComplianceButtonProps = {
  clientId: string;
  hasRequirements: boolean;
};

export function GenerateComplianceButton({
  clientId,
  hasRequirements,
}: GenerateComplianceButtonProps) {
  const [isPending, startTransition] =
    useTransition();

  const [error, setError] = useState<
    string | null
  >(null);

  function handleGenerate() {
    setError(null);

    startTransition(async () => {
      try {
        await generateComplianceChecklistAction(
          clientId
        );
      } catch (error) {
        console.error(error);

        setError(
          "Could not generate the compliance checklist."
        );
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Generating..."
          : hasRequirements
            ? "Regenerate Checklist"
            : "Generate Compliance Checklist"}
      </button>

      {error ? (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}