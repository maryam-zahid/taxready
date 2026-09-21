"use client";

import {
  CalendarDays,
  CircleAlert,
  FileText,
  Mail,
  Plus,
  Send,
} from "lucide-react";
import {
  useState,
  useTransition,
} from "react";

import { StatusBadge } from "@/components/taxready/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function formatDate(
  value: Date | string | null,
) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(
  value: Date | string | null,
) {
  if (!value) {
    return "Not sent";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getRequestTone(
  status: string,
):
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger" {
  switch (status) {
    case "DRAFT":
      return "neutral";

    case "SENT":
    case "VIEWED":
      return "info";

    case "SUBMITTED":
      return "warning";

    case "COMPLETED":
      return "success";

    case "CANCELLED":
      return "danger";

    default:
      return "neutral";
  }
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-foreground/25 focus:border-primary focus:ring-[3px] focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-60";

export function ClientRequests({
  clientId,
  requirements,
  requests,
}: ClientRequestsProps) {
  const [
    clientRequirementId,
    setClientRequirementId,
  ] = useState("");

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [dueAt, setDueAt] =
    useState("");

  const [error, setError] = useState<
    string | null
  >(null);

  const [isPending, startTransition] =
    useTransition();

  const activeRequestRequirementIds =
    new Set(
      requests
        .filter((request) =>
          [
            "DRAFT",
            "SENT",
            "VIEWED",
            "SUBMITTED",
          ].includes(request.status),
        )
        .map(
          (request) =>
            request.clientRequirementId,
        ),
    );

  const requestableRequirements =
    requirements.filter(
      (requirement) =>
        !blockedRequirementStatuses.includes(
          requirement.status,
        ) &&
        !activeRequestRequirementIds.has(
          requirement.id,
        ),
    );

  function handleCreateDraft() {
    setError(null);

    if (!clientRequirementId) {
      setError(
        "Please select a requirement.",
      );
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
        await sendClientRequestAction(
          clientId,
          requestId,
        );
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
    <section className="mt-6 space-y-4">
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base">
            Create request
          </CardTitle>

          <p className="text-sm leading-5 text-muted-foreground">
            Ask the client for information or
            documents required for their tax
            preparation.
          </p>
        </CardHeader>

        <CardContent className="p-4 tablet:p-5">
          {requestableRequirements.length >
          0 ? (
            <div className="space-y-5">
              <FormField
                label="Requirement"
                htmlFor="request-requirement"
                required
              >
                <select
                  id="request-requirement"
                  value={
                    clientRequirementId
                  }
                  onChange={(event) =>
                    setClientRequirementId(
                      event.target.value,
                    )
                  }
                  disabled={isPending}
                  className={
                    selectClassName
                  }
                >
                  <option value="">
                    Select requirement
                  </option>

                  {requestableRequirements.map(
                    (requirement) => (
                      <option
                        key={requirement.id}
                        value={requirement.id}
                      >
                        {requirement.title} —{" "}
                        {formatLabel(
                          requirement.status,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </FormField>

              <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
                <FormField
                  label="Subject"
                  htmlFor="request-subject"
                  required
                >
                  <Input
                    id="request-subject"
                    type="text"
                    value={subject}
                    onChange={(event) =>
                      setSubject(
                        event.target.value,
                      )
                    }
                    disabled={isPending}
                    placeholder="e.g. Employment income information"
                  />
                </FormField>

                <FormField
                  label="Due date"
                  htmlFor="request-due-date"
                  hint="Optional"
                >
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="request-due-date"
                      type="date"
                      value={dueAt}
                      onChange={(event) =>
                        setDueAt(
                          event.target.value,
                        )
                      }
                      disabled={isPending}
                      className="pl-9"
                    />
                  </div>
                </FormField>
              </div>

              <FormField
                label="Message"
                htmlFor="request-message"
                hint="Optional"
              >
                <Textarea
                  id="request-message"
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value,
                    )
                  }
                  disabled={isPending}
                  rows={4}
                  placeholder="Add instructions or context for the client..."
                />
              </FormField>

              {error ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/[0.04] px-3 py-2.5 text-sm text-destructive"
                >
                  <CircleAlert className="mt-0.5 size-4 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : null}

              <div className="flex justify-end border-t pt-4">
                <Button
                  type="button"
                  onClick={
                    handleCreateDraft
                  }
                  disabled={isPending}
                  className="w-full min-[480px]:w-auto"
                >
                  <Plus className="size-4" />

                  {isPending
                    ? "Creating..."
                    : "Create draft"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[150px] items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <FileText className="size-[18px]" />
                </div>

                <p className="mt-3 text-sm font-medium">
                  No requirements available
                </p>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  All applicable requirements
                  already have an active request
                  or cannot currently be
                  requested.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">
                Client requests
              </CardTitle>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Track requests sent to this
                client and their current status.
              </p>
            </div>

            {requests.length > 0 ? (
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {requests.length}{" "}
                {requests.length === 1
                  ? "request"
                  : "requests"}
              </span>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="flex min-h-[190px] items-center justify-center px-5 py-8">
              <div className="max-w-md text-center">
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Mail className="size-[18px]" />
                </div>

                <p className="mt-3 text-sm font-medium">
                  No client requests yet
                </p>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Create a request when you
                  need information or documents
                  from this client.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="px-4 py-4 transition-colors duration-150 hover:bg-muted/20 tablet:px-5"
                >
                  <div className="flex flex-col gap-3 min-[640px]:flex-row min-[640px]:items-start min-[640px]:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          {request.subject}
                        </h3>

                        <StatusBadge
                          tone={getRequestTone(
                            request.status,
                          )}
                        >
                          {formatLabel(
                            request.status,
                          )}
                        </StatusBadge>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          request.requirementTitle
                        }
                      </p>

                      {request.message ? (
                        <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-foreground/80">
                          {request.message}
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                        {request.dueAt ? (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="size-3.5" />
                            Due{" "}
                            {formatDate(
                              request.dueAt,
                            )}
                          </span>
                        ) : null}

                        {request.sentAt ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Send className="size-3.5" />
                            Sent{" "}
                            {formatDateTime(
                              request.sentAt,
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {request.status ===
                    "DRAFT" ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          handleSend(
                            request.id,
                          )
                        }
                        disabled={isPending}
                        className="w-full shrink-0 min-[480px]:w-auto"
                      >
                        <Send className="size-4" />

                        {isPending
                          ? "Sending..."
                          : "Send request"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
};

function FormField({
  label,
  htmlFor,
  children,
  required = false,
  hint,
}: FormFieldProps) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <Label htmlFor={htmlFor}>
          {label}

          {required ? (
            <span
              className="ml-1 text-destructive"
              aria-hidden="true"
            >
              *
            </span>
          ) : null}
        </Label>

        {hint ? (
          <span className="text-xs text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </div>

      {children}
    </div>
  );
}