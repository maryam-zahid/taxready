"use client";

import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
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
  cancelClientRequestAction,
  completeInformationRequestAction,
  createClientRequestAction,
  deleteDraftClientRequestAction,
  sendClientRequestAction,
  updateClientRequestAction,
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
  hasInformationResponse: boolean;
  documentId: string | null;
};

type ClientRequestsProps = {
  clientId: string;
  requirements: RequirementOption[];
  requests: ClientRequestItem[];
  requestedRequirementId?: string | null;
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
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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
    case "SENT":
    case "VIEWED":
      return "info";

    case "SUBMITTED":
      return "warning";

    case "COMPLETED":
      return "success";

    case "CANCELLED":
      return "danger";

    case "DRAFT":
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
  requestedRequirementId = null,
}: ClientRequestsProps) {
const [clientRequirementId, setClientRequirementId] =
  useState(requestedRequirementId ?? "");

const [subject, setSubject] = useState(() => {
  if (!requestedRequirementId) return "";

  return (
    requirements.find(
      (requirement) =>
        requirement.id === requestedRequirementId,
    )?.title ?? ""
  );
});
  const [message, setMessage] =
    useState("");

  const [dueAt, setDueAt] =
    useState("");

  const [error, setError] = useState<
    string | null
  >(null);

  const [isPending, startTransition] =
    useTransition();
const [isCreateOpen, setIsCreateOpen] =
  useState(Boolean(requestedRequirementId));

    const [openMenuId, setOpenMenuId] =
  useState<string | null>(null);

const [editingRequest, setEditingRequest] =
  useState<ClientRequestItem | null>(null);

const [editSubject, setEditSubject] =
  useState("");

const [editMessage, setEditMessage] =
  useState("");

const [editDueAt, setEditDueAt] =
  useState("");

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
        setIsCreateOpen(false);
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

  function handleCompleteInformation(
    requestId: string,
  ) {
    setError(null);

    startTransition(async () => {
      try {
        await completeInformationRequestAction(
          clientId,
          requestId,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to approve information.",
        );
      }
    });
  }
  
  function handleStartEdit(
  request: ClientRequestItem,
) {
  setError(null);
  setOpenMenuId(null);

  setEditingRequest(request);
  setEditSubject(request.subject);
  setEditMessage(request.message ?? "");

  if (request.dueAt) {
    const date = new Date(request.dueAt);

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1,
    ).padStart(2, "0");
    const day = String(
      date.getDate(),
    ).padStart(2, "0");

    setEditDueAt(
      `${year}-${month}-${day}`,
    );
  } else {
    setEditDueAt("");
  }
}

function handleCloseEdit() {
  if (isPending) {
    return;
  }

  setEditingRequest(null);
  setEditSubject("");
  setEditMessage("");
  setEditDueAt("");
}

function handleSaveEdit() {
  if (!editingRequest) {
    return;
  }

  if (!editSubject.trim()) {
    setError("Subject is required.");
    return;
  }

  setError(null);

  startTransition(async () => {
    try {
      await updateClientRequestAction(
        clientId,
        editingRequest.id,
        {
          subject: editSubject,
          message: editMessage,
          dueAt: editDueAt,
        },
      );

      handleCloseEdit();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update request.",
      );
    }
  });
}

function handleCancelRequest(
  requestId: string,
) {
  const confirmed = window.confirm(
    "Cancel this request? The client will no longer be expected to respond to it.",
  );

  if (!confirmed) {
    return;
  }

  setError(null);
  setOpenMenuId(null);

  startTransition(async () => {
    try {
      await cancelClientRequestAction(
        clientId,
        requestId,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel request.",
      );
    }
  });
}

function handleDeleteDraft(
  requestId: string,
) {
  const confirmed = window.confirm(
    "Delete this draft permanently?",
  );

  if (!confirmed) {
    return;
  }

  setError(null);
  setOpenMenuId(null);

  startTransition(async () => {
    try {
      await deleteDraftClientRequestAction(
        clientId,
        requestId,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete draft.",
      );
    }
  });
}

  return (
<section
  id="client-requests"
  className="mt-6 scroll-mt-6"
>
        <Card className="overflow-hidden border-border bg-card shadow-xs">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base">
                Client requests
              </CardTitle>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Track information and document requests
                for this client.
              </p>
            </div>

            {requestableRequirements.length >
            0 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setError(null);
                  setIsCreateOpen(
                    (current) => !current,
                  );
                }}
                className="w-full min-[560px]:w-auto"
              >
                {isCreateOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}

                {isCreateOpen
                  ? "Close"
                  : "New request"}
              </Button>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                {requests.length}{" "}
                {requests.length === 1
                  ? "request"
                  : "requests"}
              </span>
            )}
          </div>
        </CardHeader>

        {isCreateOpen &&
        requestableRequirements.length > 0 ? (
          <div className="border-b bg-muted/20">
            <div className="p-4 tablet:p-5">
              <div className="mb-5">
                <h3 className="text-sm font-semibold">
                  Create a new request
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Request outstanding information or
                  supporting evidence from the client.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
                <FormField
                  label="Requirement"
                  htmlFor="request-requirement"
                  required
                >
                  <select
                    id="request-requirement"
                    value={clientRequirementId}
                    onChange={(event) =>
                      setClientRequirementId(
                        event.target.value,
                      )
                    }
                    disabled={isPending}
                    className={selectClassName}
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

                <div className="tablet:col-span-2">
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
                </div>

                <div className="tablet:col-span-2">
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
                      rows={3}
                      placeholder="Add instructions or context for the client..."
                    />
                  </FormField>
                </div>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/[0.04] px-3 py-2.5 text-sm text-destructive"
                >
                  <CircleAlert className="mt-0.5 size-4 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : null}

              <div className="mt-5 flex flex-col-reverse gap-2 border-t pt-4 min-[480px]:flex-row min-[480px]:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    setError(null);
                    setIsCreateOpen(false);
                  }}
                  className="w-full min-[480px]:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleCreateDraft}
                  disabled={isPending}
                  className="w-full min-[480px]:w-auto"
                >
                  {isPending
                    ? "Creating..."
                    : "Create draft"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
{editingRequest ? (
  <div className="border-b bg-muted/20">
    <div className="p-4 tablet:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">
            Edit request
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {
              editingRequest.requirementTitle
            }
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleCloseEdit}
          disabled={isPending}
          aria-label="Close edit form"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 tablet:grid-cols-2">
        <FormField
          label="Subject"
          htmlFor="edit-request-subject"
          required
        >
          <Input
            id="edit-request-subject"
            value={editSubject}
            onChange={(event) =>
              setEditSubject(
                event.target.value,
              )
            }
            disabled={isPending}
          />
        </FormField>

        <FormField
          label="Due date"
          htmlFor="edit-request-due-date"
          hint="Optional"
        >
          <Input
            id="edit-request-due-date"
            type="date"
            value={editDueAt}
            onChange={(event) =>
              setEditDueAt(
                event.target.value,
              )
            }
            disabled={isPending}
          />
        </FormField>

        <div className="tablet:col-span-2">
          <FormField
            label="Message"
            htmlFor="edit-request-message"
            hint="Optional"
          >
            <Textarea
              id="edit-request-message"
              rows={3}
              value={editMessage}
              onChange={(event) =>
                setEditMessage(
                  event.target.value,
                )
              }
              disabled={isPending}
            />
          </FormField>
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 border-t pt-4 min-[480px]:flex-row min-[480px]:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCloseEdit}
          disabled={isPending}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={handleSaveEdit}
          disabled={isPending}
        >
          {isPending
            ? "Saving..."
            : "Save changes"}
        </Button>
      </div>
    </div>
  </div>
) : null}

        <CardContent className="p-0">
          {error && !isCreateOpen ? (
            <div
              role="alert"
              className="m-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/[0.04] px-3 py-2.5 text-sm text-destructive tablet:m-5"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          {requests.length === 0 ? (
            <div className="flex min-h-[190px] items-center justify-center px-5 py-8">
              <div className="max-w-md text-center">
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <FileText className="size-[18px]" />
                </div>

                <p className="mt-3 text-sm font-medium">
                  No client requests yet
                </p>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Create a request when information
                  or supporting evidence is required.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop / tablet table */}
              <div className="hidden min-[760px]:block">
                <div className="grid grid-cols-[minmax(0,2fr)_130px_130px_minmax(110px,auto)] items-center gap-4 border-b bg-muted/25 px-5 py-2.5 text-xs font-medium text-muted-foreground">
                  <span>Request</span>
                  <span>Due date</span>
                  <span>Status</span>
                  <span className="text-right">
                    Action
                  </span>
                </div>

                <div className="divide-y">
                  {requests.map((request) => (
                  <div
  key={request.id}
  id={`request-${request.id}`}
  className="grid scroll-mt-24 grid-cols-[minmax(0,2fr)_130px_130px_minmax(110px,auto)] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/20 target:bg-primary/5"
>
 <div className="min-w-0">
  <Link
    href={
      request.documentId
        ? `/documents/${request.documentId}`
        : `/clients/${clientId}?requestRequirement=${encodeURIComponent(
            request.clientRequirementId,
          )}#client-requests`
    }
    className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
  >
    {request.requirementTitle}
  </Link>

  <p className="mt-1 truncate text-xs text-muted-foreground">
    {request.subject}
  </p>
</div>

                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          request.dueAt,
                        )}
                      </p>

                      <div>
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

                      <div className="flex justify-end">
                       <RequestAction
  request={request}
  isPending={isPending}
  openMenuId={openMenuId}
  onMenuChange={setOpenMenuId}
  onSend={handleSend}
  onApprove={handleCompleteInformation}
  onEdit={handleStartEdit}
  onCancel={handleCancelRequest}
  onDelete={handleDeleteDraft}
/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile */}
              <div className="divide-y min-[760px]:hidden">
                {requests.map((request) => (
                 <div
  key={request.id}
  id={`request-mobile-${request.id}`}
  className="px-4 py-4"
>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
 <Link
  href={
    request.documentId
      ? `/documents/${request.documentId}`
      : `#request-mobile-${request.id}`
  }

  className="block text-sm font-medium text-foreground hover:text-primary hover:underline"
>
  {request.requirementTitle}
</Link>
  <p className="mt-1 text-xs leading-5 text-muted-foreground">
    {request.subject}
  </p>
</div>

                      <StatusBadge
                        tone={getRequestTone(
                          request.status,
                        )}
                        className="shrink-0"
                      >
                        {formatLabel(
                          request.status,
                        )}
                      </StatusBadge>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Due
                        </p>

                        <p className="mt-0.5 text-xs font-medium">
                          {formatDate(
                            request.dueAt,
                          )}
                        </p>
                      </div>

                     <RequestAction
  request={request}
  isPending={isPending}
  openMenuId={openMenuId}
  onMenuChange={setOpenMenuId}
  onSend={handleSend}
  onApprove={handleCompleteInformation}
  onEdit={handleStartEdit}
  onCancel={handleCancelRequest}
  onDelete={handleDeleteDraft}
/>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {requests.length > 0 &&
          requestableRequirements.length === 0 ? (
            <div className="border-t bg-muted/20 px-4 py-3 tablet:px-5">
              <p className="text-xs text-muted-foreground">
                All applicable requirements already
                have a request or are complete.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

type RequestActionProps = {
  request: ClientRequestItem;
  isPending: boolean;
  openMenuId: string | null;
  onMenuChange: (
    requestId: string | null,
  ) => void;
  onSend: (requestId: string) => void;
  onApprove: (requestId: string) => void;
  onEdit: (
    request: ClientRequestItem,
  ) => void;
  onCancel: (requestId: string) => void;
  onDelete: (requestId: string) => void;
};

function RequestAction({
  request,
  isPending,
  openMenuId,
  onMenuChange,
  onSend,
  onApprove,
  onEdit,
  onCancel,
  onDelete,
}: RequestActionProps) {
  const isMenuOpen =
    openMenuId === request.id;

  const canEdit = [
    "DRAFT",
    "SENT",
    "VIEWED",
  ].includes(request.status);

  const canCancel = [
    "SENT",
    "VIEWED",
  ].includes(request.status);

  const canDelete =
    request.status === "DRAFT";

  if (
    request.status === "SUBMITTED" &&
    request.hasInformationResponse
  ) {
    return (
      <Button
        type="button"
        size="sm"
        onClick={() =>
          onApprove(request.id)
        }
        disabled={isPending}
      >
        {isPending
          ? "Approving..."
          : "Review & approve"}
      </Button>
    );
  }

  return (
    <div className="relative flex items-center justify-end gap-2">
      {request.status === "DRAFT" ? (
        <Button
          type="button"
          size="sm"
          onClick={() =>
            onSend(request.id)
          }
          disabled={isPending}
        >
          <Send className="size-3.5" />
          Send
        </Button>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={isPending}
        aria-label={`Actions for ${request.requirementTitle}`}
        aria-expanded={isMenuOpen}
        onClick={() =>
          onMenuChange(
            isMenuOpen
              ? null
              : request.id,
          )
        }
      >
        <MoreHorizontal className="size-4" />
      </Button>

      {isMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Close request actions"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() =>
              onMenuChange(null)
            }
          />

          <div className="absolute right-0 top-10 z-50 w-48 overflow-hidden rounded-lg border bg-popover p-1 shadow-lg">
            {canEdit ? (
              <button
                type="button"
                onClick={() =>
                  onEdit(request)
                }
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <Pencil className="size-3.5 text-muted-foreground" />
                Edit request
              </button>
            ) : null}

            {canCancel ? (
              <button
                type="button"
                onClick={() =>
                  onCancel(request.id)
                }
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <X className="size-3.5 text-muted-foreground" />
                Cancel request
              </button>
            ) : null}

            {canDelete ? (
              <button
                type="button"
                onClick={() =>
                  onDelete(request.id)
                }
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/5"
              >
                <Trash2 className="size-3.5" />
                Delete draft
              </button>
            ) : null}

            {!canEdit &&
            !canCancel &&
            !canDelete ? (
              <div className="px-2.5 py-2 text-xs leading-5 text-muted-foreground">
                No actions available for this
                completed request.
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
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