"use client";

import { useState, useTransition } from "react";

import {
  createClientRequestAction,
  sendClientRequestAction,
} from "./actions";

type RequirementOption = {
  id: string;
  status: string;
  title: string;
};

type ClientRequestItem = {
  id: string;
  clientRequirementId: string;
  status: string;
  subject: string;
  message: string | null;
  dueAt: Date | string | null;
  sentAt: Date | string | null;
  requirementTitle: string;
};

type ClientRequestsProps = {
  clientId: string;
  requirements: RequirementOption[];
  requests: ClientRequestItem[];
};

const blockedRequirementStatuses = [
  "COMPLETED",
  "NOT_APPLICABLE",
  "WAIVED",
];

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ClientRequests({
  clientId,
  requirements,
  requests,
}: ClientRequestsProps) {
  const [clientRequirementId, setClientRequirementId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

 const activeRequestRequirementIds = new Set(
  requests
    .filter((request) =>
      ["DRAFT", "SENT", "VIEWED", "SUBMITTED"].includes(
        request.status,
      ),
    )
    .map((request) => request.clientRequirementId),
);

const requestableRequirements = requirements.filter(
  (requirement) =>
    !blockedRequirementStatuses.includes(requirement.status) &&
    !activeRequestRequirementIds.has(requirement.id),
);

  function handleCreateDraft() {
    setError(null);

    if (!clientRequirementId) {
      setError("Please select a requirement.");
      return;
    }

    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }

    startTransition(async () => {
      try {
        await createClientRequestAction(
          clientId,
          clientRequirementId,
          subject,
          message,
          dueAt,
        );

        setClientRequirementId("");
        setSubject("");
        setMessage("");
        setDueAt("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to create request.",
        );
      }
    });
  }

  function handleSend(requestId: string) {
    setError(null);

    startTransition(async () => {
      try {
        await sendClientRequestAction(clientId, requestId);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to send request.",
        );
      }
    });
  }

  return (
    <section style={{ marginTop: 32 }}>
      <h2>Client Requests</h2>

      <p>
        Create requests for compliance information or documents required
        from this client.
      </p>

      <div
        style={{
          border: "1px solid #ddd",
          padding: 16,
          marginTop: 16,
        }}
      >
        <h3>Create Request</h3>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="request-requirement">
            Requirement
          </label>

          <br />

          <select
            id="request-requirement"
            value={clientRequirementId}
            onChange={(event) =>
              setClientRequirementId(event.target.value)
            }
            disabled={isPending}
          >
            <option value="">Select requirement</option>

            {requestableRequirements.map((requirement) => (
              <option key={requirement.id} value={requirement.id}>
                {requirement.title} — {formatLabel(requirement.status)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="request-subject">Subject</label>

          <br />

          <input
            id="request-subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            disabled={isPending}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="request-message">Message</label>

          <br />

          <textarea
            id="request-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isPending}
            rows={4}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="request-due-date">Due Date</label>

          <br />

          <input
            id="request-due-date"
            type="date"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
            disabled={isPending}
          />
        </div>

        {error ? (
          <p style={{ marginTop: 12 }}>
            Error: {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleCreateDraft}
          disabled={isPending}
          style={{ marginTop: 16 }}
        >
          {isPending ? "Working..." : "Create Draft Request"}
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Requests</h3>

        {requests.length === 0 ? (
          <p>No requests have been created yet.</p>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              style={{
                border: "1px solid #ddd",
                padding: 16,
                marginTop: 12,
              }}
            >
              <strong>{request.subject}</strong>

              <p>
                Requirement: {request.requirementTitle}
              </p>

              <p>
                Status: {formatLabel(request.status)}
              </p>

              {request.message ? (
                <p>Message: {request.message}</p>
              ) : null}

              {request.dueAt ? (
                <p>
                  Due:{" "}
                  {new Date(request.dueAt).toLocaleDateString()}
                </p>
              ) : null}

              {request.sentAt ? (
                <p>
                  Sent:{" "}
                  {new Date(request.sentAt).toLocaleString()}
                </p>
              ) : null}

              {request.status === "DRAFT" ? (
                <button
                  type="button"
                  onClick={() => handleSend(request.id)}
                  disabled={isPending}
                >
                  {isPending ? "Working..." : "Send Request"}
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}