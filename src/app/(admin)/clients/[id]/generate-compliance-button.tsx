"use client";

import {
  CircleAlert,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { generateComplianceChecklistAction } from "./actions";

type GenerateComplianceButtonProps = {
  clientId: string;
  hasRequirements: boolean;
  hasTaxProfile: boolean;
};

export function GenerateComplianceButton({
  clientId,
  hasRequirements,
  hasTaxProfile,
}: GenerateComplianceButtonProps) {
  const [isPending, startTransition] =
    useTransition();

  const [error, setError] = useState<
    string | null
  >(null);

  function handleGenerate() {
    if (!hasTaxProfile) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await generateComplianceChecklistAction(
          clientId,
        );
      } catch (error) {
        console.error(error);

        if (
          error instanceof Error &&
          error.message.includes(
            "TAX_PROFILE_NOT_FOUND",
          )
        ) {
          setError(
            "Complete the client's tax profile before generating requirements.",
          );
          return;
        }

        setError(
          "Unable to generate requirements. Please try again.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={
          hasRequirements
            ? "outline"
            : "default"
        }
        disabled={
          isPending || !hasTaxProfile
        }
        onClick={handleGenerate}
        className="w-full min-[480px]:w-auto"
      >
        {isPending ? (
          <RefreshCw className="size-4 animate-spin motion-reduce:animate-none" />
        ) : hasRequirements ? (
          <RefreshCw className="size-4" />
        ) : (
          <Sparkles className="size-4" />
        )}

        {isPending
          ? "Generating..."
          : hasRequirements
            ? "Refresh requirements"
            : "Generate requirements"}
      </Button>

      {!hasTaxProfile ? (
        <div className="flex max-w-md items-start gap-2 text-sm text-muted-foreground">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />

          <p>
            Complete the tax profile before
            generating compliance requirements.
          </p>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex max-w-md items-start gap-2 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}
    </div>
  );
}