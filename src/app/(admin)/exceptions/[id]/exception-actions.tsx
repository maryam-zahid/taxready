"use client";

import {
  CheckCircle2,
  Clock3,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { updateExceptionAction } from "./actions";

type ExceptionActionsProps = {
  exceptionId: string;
  status: string;
  initialResolutionNote: string | null;
};

export function ExceptionActions({
  exceptionId,
  status,
  initialResolutionNote,
}: ExceptionActionsProps) {
  const router = useRouter();

  const [note, setNote] = useState(
    initialResolutionNote ?? "",
  );

  const [error, setError] = useState("");

  const [isPending, startTransition] =
    useTransition();

  const isClosed =
    status === "RESOLVED" ||
    status === "WAIVED";

  function updateStatus(
    nextStatus:
      | "WAITING_CLIENT"
      | "UNDER_REVIEW"
      | "RESOLVED"
      | "WAIVED",
  ) {
    setError("");

    const isClosing =
      nextStatus === "RESOLVED" ||
      nextStatus === "WAIVED";

    if (isClosing && !note.trim()) {
      setError(
        "Add a resolution note before closing this exception.",
      );
      return;
    }

    startTransition(async () => {
      try {
        await updateExceptionAction({
          exceptionId,
          status: nextStatus,
          resolutionNote: note,
        });

        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (letter) =>
                  letter.toUpperCase(),
                )
            : "The exception could not be updated.",
        );
      }
    });
  }

  if (isClosed) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 text-success-foreground" />

          <div>
            <p className="font-medium">
              Exception closed
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              This exception is no longer an active
              readiness blocker.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="resolution-note">
          Resolution note
        </Label>

        <Textarea
          id="resolution-note"
          value={note}
          onChange={(event) =>
            setNote(event.target.value)
          }
          placeholder="Explain how this exception was resolved or why it is being waived..."
          rows={5}
          disabled={isPending}
        />

        <p className="text-xs text-muted-foreground">
          A resolution note is required when
          resolving or waiving an exception.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 tablet:grid-cols-2">
        <Button
          variant="outline"
          type="button"
          disabled={isPending}
          onClick={() =>
            updateStatus("WAITING_CLIENT")
          }
        >
          <Clock3 className="size-4" />
          Waiting for Client
        </Button>

        <Button
          variant="outline"
          type="button"
          disabled={isPending}
          onClick={() =>
            updateStatus("UNDER_REVIEW")
          }
        >
          <Eye className="size-4" />
          Under Review
        </Button>

        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            updateStatus("RESOLVED")
          }
        >
          <CheckCircle2 className="size-4" />
          Resolve
        </Button>

        <Button
          variant="secondary"
          type="button"
          disabled={isPending}
          onClick={() =>
            updateStatus("WAIVED")
          }
        >
          <ShieldCheck className="size-4" />
          Waive
        </Button>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">
          Updating exception...
        </p>
      ) : null}
    </div>
  );
}