"use client";

import {
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { runDocumentValidationAction } from "./validation-actions";

type RunValidationButtonProps = {
  documentId: string;
  hasValidation: boolean;
};

export function RunValidationButton({
  documentId,
  hasValidation,
}: RunValidationButtonProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [error, setError] = useState("");

  function handleValidation() {
    setError("");

    startTransition(async () => {
      try {
        await runDocumentValidationAction(
          documentId,
        );

        router.refresh();
      } catch {
        setError(
          "Validation could not be completed.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={
          hasValidation
            ? "outline"
            : "default"
        }
        disabled={isPending}
        onClick={handleValidation}
      >
        {isPending ? (
          <RefreshCw className="size-4 animate-spin" />
        ) : hasValidation ? (
          <RefreshCw className="size-4" />
        ) : (
          <ShieldCheck className="size-4" />
        )}

        {isPending
          ? "Validating..."
          : hasValidation
            ? "Run Validation Again"
            : "Run Validation"}
      </Button>

      {error ? (
        <p className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}