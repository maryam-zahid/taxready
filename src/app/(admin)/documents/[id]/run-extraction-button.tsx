"use client";

import {
  FileSearch,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";

import { runDocumentExtractionAction } from "./extraction-actions";

type RunExtractionButtonProps = {
  documentId: string;
  hasExtraction: boolean;
};

export function RunExtractionButton({
  documentId,
  hasExtraction,
}: RunExtractionButtonProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [error, setError] = useState("");

  function handleExtraction() {
    setError("");

    startTransition(async () => {
      try {
        await runDocumentExtractionAction(
          documentId,
        );

        router.refresh();
      } catch (error) {
        console.error(
          "Document extraction failed:",
          error,
        );

        setError(
          "Document data could not be extracted. The file may require OCR or practitioner review.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={
          hasExtraction
            ? "outline"
            : "default"
        }
        disabled={isPending}
        onClick={handleExtraction}
      >
        {isPending ? (
          <RefreshCw className="size-4 animate-spin" />
        ) : hasExtraction ? (
          <RefreshCw className="size-4" />
        ) : (
          <FileSearch className="size-4" />
        )}

        {isPending
          ? "Extracting..."
          : hasExtraction
            ? "Run Extraction Again"
            : "Extract Document Data"}
      </Button>

      {error ? (
        <p className="max-w-xl text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}