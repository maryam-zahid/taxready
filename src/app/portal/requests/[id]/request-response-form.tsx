"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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

  const [showNotAvailable, setShowNotAvailable] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

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
      } catch (error) {
        console.error(error);

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
      } catch (error) {
        console.error(error);

        setError(
          "We could not submit your response. Please try again.",
        );
      }
    });
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 20,
      }}
    >
      {responseType === "DOCUMENT" && (
        <div>
          <p>
            Upload the document requested by your tax
            practice.
          </p>

          <button type="button" disabled>
            Upload Document
          </button>

          <p
            style={{
              marginBottom: 0,
              fontSize: 14,
            }}
          >
            Secure document upload will be available
            in the next step.
          </p>
        </div>
      )}

      {responseType === "DOCUMENT_OR_INFORMATION" &&
        !showInformation && (
          <div>
            <p>
              You can upload supporting documentation
              or provide the requested information
              directly.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button type="button" disabled>
                Upload Document
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setShowNotAvailable(false);
                  setShowInformation(true);
                }}
                disabled={isPending}
              >
                Provide Information
              </button>
            </div>
          </div>
        )}

      {(responseType === "INFORMATION" ||
        showInformation) && (
        <form onSubmit={submitInformation}>
          <label
            htmlFor="information-response"
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            Your response
          </label>

          <textarea
            id="information-response"
            value={informationText}
            onChange={(event) =>
              setInformationText(event.target.value)
            }
            rows={7}
            disabled={isPending}
            placeholder="Provide the requested information..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 12,
              resize: "vertical",
            }}
          />

          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 12,
            }}
          >
            <button
              type="submit"
              disabled={isPending}
            >
              {isPending
                ? "Submitting..."
                : "Submit Response"}
            </button>

            {responseType ===
              "DOCUMENT_OR_INFORMATION" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setError(null);
                  setShowInformation(false);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div
        style={{
          paddingTop: 20,
          borderTop: "1px solid #e5e7eb",
        }}
      >
        {!showNotAvailable ? (
          <>
            <p
              style={{
                marginTop: 0,
              }}
            >
              Can&apos;t provide this item?
            </p>

            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setError(null);
                setShowInformation(false);
                setShowNotAvailable(true);
              }}
            >
              Mark as Not Available
            </button>
          </>
        ) : (
          <form onSubmit={submitNotAvailable}>
            <label
              htmlFor="not-available-reason"
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Why is this item not available?
            </label>

            <textarea
              id="not-available-reason"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              rows={4}
              disabled={isPending}
              placeholder="For example: My employer has not provided this document yet."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 12,
                resize: "vertical",
              }}
            />

            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 12,
              }}
            >
              <button
                type="submit"
                disabled={isPending}
              >
                {isPending
                  ? "Submitting..."
                  : "Submit as Not Available"}
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setError(null);
                  setShowNotAvailable(false);

                  if (
                    responseType === "INFORMATION"
                  ) {
                    setShowInformation(true);
                  }
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}