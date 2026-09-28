"use client";

import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { reviewDocumentAction } from "./actions";

type DocumentReviewFormProps = {
  documentId: string;
  initialNote: string | null;
};

export function DocumentReviewForm({
  documentId,
  initialNote,
}: DocumentReviewFormProps) {
  const router = useRouter();

  const [reviewNote, setReviewNote] = useState(
    initialNote ?? "",
  );

  const [error, setError] = useState("");

  const [isPending, startTransition] =
    useTransition();

  function review(
    status:
      | "APPROVED"
      | "NEEDS_REVIEW"
      | "REJECTED",
  ) {
    setError("");

    if (
  (status === "NEEDS_REVIEW" ||
    status === "REJECTED") &&
  !reviewNote.trim()
) {
     setError(
  "Add a review note explaining the review decision.",
);
      return;
    }

    startTransition(async () => {
      try {
        await reviewDocumentAction({
          documentId,
          status,
          reviewNote,
        });

        router.refresh();
      } catch {
        setError(
          "The document review could not be saved.",
        );
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="review-note">
          Review note
        </Label>

        <Textarea
          id="review-note"
          value={reviewNote}
          onChange={(event) =>
            setReviewNote(event.target.value)
          }
          placeholder="Add an internal review note or explain what needs attention..."
          rows={5}
          disabled={isPending}
        />

        <p className="text-xs text-muted-foreground">
          A note is required when marking a
          document as Needs Review.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 tablet:grid-cols-3">
        <Button
          type="button"
          onClick={() => review("APPROVED")}
          disabled={isPending}
        >
          <CheckCircle2 className="size-4" />
          Approve
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            review("NEEDS_REVIEW")
          }
          disabled={isPending}
        >
          <AlertTriangle className="size-4" />
          Needs Review
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={() => review("REJECTED")}
          disabled={isPending}
        >
          <XCircle className="size-4" />
          Reject
        </Button>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">
          Saving review...
        </p>
      ) : null}
    </div>
  );
}