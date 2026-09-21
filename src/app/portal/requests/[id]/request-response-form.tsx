"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DocumentUploadForm } from "./document-upload-form";
import {
  markNotAvailableAction,
  submitInformationResponseAction,
} from "./actions";

type RequestResponseFormProps = {
  requestId: string;
  responseType:
    | "DOCUMENT"
    | "INFORMATION"
    | "DOCUMENT_OR_INFORMATION";
};

export function RequestResponseForm({
  requestId,
  responseType,
}: RequestResponseFormProps) {
  const router = useRouter();

  const [informationText, setInformationText] =
    useState("");

  const [reason, setReason] = useState("");

  const [showInformation, setShowInformation] =
    useState(responseType === "INFORMATION");

  const [showDocumentUpload, setShowDocumentUpload] =
    useState(responseType === "DOCUMENT");

  const [showNotAvailable, setShowNotAvailable] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  function submitInformation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const value = informationText.trim();

    if (!value) {
      setError(
        "Please provide the requested information before submitting.",
      );
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await submitInformationResponseAction(
          requestId,
          value,
        );

        router.refresh();
      } catch (submitError) {
        console.error(submitError);

        setError(
          "We could not submit your response. Please try again.",
        );
      }
    });
  }

  function submitNotAvailable(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const value = reason.trim();

    if (!value) {
      setError(
        "Please explain why this item is not available.",
      );
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await markNotAvailableAction(
          requestId,
          value,
        );

        router.refresh();
      } catch (submitError) {
        console.error(submitError);

        setError(
          "We could not submit your response. Please try again.",
        );
      }
    });
  }

  function showDocumentOption() {
    setError(null);
    setShowNotAvailable(false);
    setShowInformation(false);
    setShowDocumentUpload(true);
  }

  function showInformationOption() {
    setError(null);
    setShowNotAvailable(false);
    setShowDocumentUpload(false);
    setShowInformation(true);
  }

  function showNotAvailableOption() {
    setError(null);
    setShowInformation(false);
    setShowDocumentUpload(false);
    setShowNotAvailable(true);
  }

  return (
    <div className="space-y-6">
      {responseType === "DOCUMENT_OR_INFORMATION" &&
        !showInformation &&
        !showDocumentUpload &&
        !showNotAvailable && (
          <div className="space-y-4">
            <div>
              <p className="font-medium">
                Choose how you would like to respond
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Upload the requested supporting document or
                provide the information directly.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={showDocumentOption}
                disabled={isPending}
              >
                <FileText className="size-4" />
                Upload document
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={showInformationOption}
                disabled={isPending}
              >
                <Info className="size-4" />
                Provide information
              </Button>
            </div>
          </div>
        )}

      {showDocumentUpload && !showNotAvailable && (
        <div className="space-y-4">
          <DocumentUploadForm requestId={requestId} />

          {responseType === "DOCUMENT_OR_INFORMATION" && (
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setError(null);
                setShowDocumentUpload(false);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {showInformation && !showNotAvailable && (
        <form
          onSubmit={submitInformation}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label
              htmlFor="information-response"
              className="text-sm font-medium"
            >
              Your response
            </label>

            <Textarea
              id="information-response"
              value={informationText}
              onChange={(event) =>
                setInformationText(event.target.value)
              }
              rows={7}
              disabled={isPending}
              placeholder="Provide the requested information..."
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              disabled={
                isPending || !informationText.trim()
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit response"
              )}
            </Button>

            {responseType ===
              "DOCUMENT_OR_INFORMATION" && (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setError(null);
                  setShowInformation(false);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      <div className="border-t pt-5">
        {!showNotAvailable ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">
                Can&apos;t provide this item?
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Let your tax practice know why this item
                cannot be provided.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={showNotAvailableOption}
            >
              <XCircle className="size-4" />
              Mark as not available
            </Button>
          </div>
        ) : (
          <form
            onSubmit={submitNotAvailable}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="not-available-reason"
                className="text-sm font-medium"
              >
                Why is this item not available?
              </label>

              <Textarea
                id="not-available-reason"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                rows={4}
                disabled={isPending}
                placeholder="For example: My employer has not provided this document yet."
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                disabled={
                  isPending || !reason.trim()
                }
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit as not available"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setError(null);
                  setShowNotAvailable(false);

                  if (responseType === "INFORMATION") {
                    setShowInformation(true);
                  }

                  if (responseType === "DOCUMENT") {
                    setShowDocumentUpload(true);
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}