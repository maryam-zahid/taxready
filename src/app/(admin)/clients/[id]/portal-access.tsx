"use client";

import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  ExternalLink,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  XCircle,
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

import {
  revokeClientInvitationAction,
  sendClientInvitationAction,
} from "./actions";

type PortalAccessProps = {
  clientId: string;
  email: string | null;

  portalAccess: {
    status: string;
    invitedAt: Date | string | null;
    activatedAt: Date | string | null;
    disabledAt: Date | string | null;
  } | null;

  latestInvitation: {
    id: string;
    status: string;
    email: string;
    sentAt: Date | string;
    expiresAt: Date | string;
  } | null;
};

function formatDate(
  value: Date | string | null,
) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function getPortalTone(
  status: string,
):
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger" {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "INVITED":
      return "info";

    case "DISABLED":
      return "danger";

    default:
      return "neutral";
  }
}

function getInvitationTone(
  status: string,
):
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger" {
  switch (status) {
    case "ACCEPTED":
      return "success";

    case "PENDING":
      return "info";

    case "EXPIRED":
      return "warning";

    case "REVOKED":
      return "neutral";

    default:
      return "neutral";
  }
}

export function PortalAccess({
  clientId,
  email,
  portalAccess,
  latestInvitation,
}: PortalAccessProps) {
  const [isPending, startTransition] =
    useTransition();

  const [message, setMessage] = useState<
    string | null
  >(null);

  const [isError, setIsError] =
    useState(false);

  const [testInviteUrl, setTestInviteUrl] =
    useState<string | null>(null);

  const [copied, setCopied] =
    useState(false);

  const portalStatus =
    portalAccess?.status ?? "NOT_INVITED";

  const canInvite =
    portalStatus !== "ACTIVE" &&
    portalStatus !== "DISABLED";

  const hasPendingInvitation =
    latestInvitation?.status === "PENDING";

  function handleSendInvitation() {
    setMessage(null);
    setIsError(false);
    setTestInviteUrl(null);
    setCopied(false);

    startTransition(async () => {
      try {
        const result =
          await sendClientInvitationAction(
            clientId,
          );

        const inviteUrl =
          `${window.location.origin}/invite/${result.token}`;

        setTestInviteUrl(inviteUrl);

        setMessage(
          hasPendingInvitation
            ? "A new invitation was created. The previous invitation is no longer valid."
            : "Portal invitation created successfully.",
        );
      } catch (error) {
        console.error(error);

        setIsError(true);
        setMessage(
          "Unable to create the portal invitation.",
        );
      }
    });
  }

  function handleRevokeInvitation() {
    if (!latestInvitation) {
      return;
    }

    setMessage(null);
    setIsError(false);
    setTestInviteUrl(null);
    setCopied(false);

    startTransition(async () => {
      try {
        await revokeClientInvitationAction(
          clientId,
          latestInvitation.id,
        );

        setMessage(
          "Portal invitation revoked successfully.",
        );
      } catch (error) {
        console.error(error);

        setIsError(true);
        setMessage(
          "Unable to revoke the portal invitation.",
        );
      }
    });
  }

  async function handleCopyLink() {
    if (!testInviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        testInviteUrl,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mt-6">
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-3 min-[560px]:flex-row min-[560px]:items-start min-[560px]:justify-between">
            <div>
              <CardTitle className="text-base">
                Client portal
              </CardTitle>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Manage secure TaxReady portal
                access for this client.
              </p>
            </div>

            <StatusBadge
              tone={getPortalTone(
                portalStatus,
              )}
              className="w-fit"
            >
              {formatStatus(portalStatus)}
            </StatusBadge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 divide-y tablet:grid-cols-2 tablet:divide-x tablet:divide-y-0">
            <PortalInfo
              icon={Mail}
              label="Portal email"
              value={
                email ||
                "No email available"
              }
            />

            <PortalInfo
              icon={UserCheck}
              label="Activated"
              value={
                portalAccess?.activatedAt
                  ? formatDate(
                      portalAccess.activatedAt,
                    )
                  : "Not activated"
              }
            />
          </div>

          <div className="border-t">
            <div className="grid grid-cols-1 divide-y tablet:grid-cols-3 tablet:divide-x tablet:divide-y-0">
              <PortalInfo
                icon={ShieldCheck}
                label="Latest invitation"
                value={
                  latestInvitation
                    ? formatStatus(
                        latestInvitation.status,
                      )
                    : "No invitation"
                }
                badge={
                  latestInvitation
                    ? {
                        text: formatStatus(
                          latestInvitation.status,
                        ),
                        tone:
                          getInvitationTone(
                            latestInvitation.status,
                          ),
                      }
                    : undefined
                }
              />

              <PortalInfo
                icon={Clock3}
                label="Last invited"
                value={
                  portalAccess?.invitedAt
                    ? formatDate(
                        portalAccess.invitedAt,
                      )
                    : "Not invited"
                }
              />

              <PortalInfo
                icon={Clock3}
                label="Invitation expires"
                value={
                  latestInvitation
                    ? formatDate(
                        latestInvitation.expiresAt,
                      )
                    : "Not applicable"
                }
              />
            </div>
          </div>

          <div className="border-t px-4 py-4 tablet:px-5">
            <div className="flex flex-col gap-3 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
              <p className="max-w-xl text-sm leading-5 text-muted-foreground">
                {portalStatus === "ACTIVE"
                  ? "This client has activated their portal account and can securely access TaxReady."
                  : portalStatus ===
                      "DISABLED"
                    ? "Portal access is currently disabled for this client."
                    : hasPendingInvitation
                      ? "An invitation is waiting for the client to accept it."
                      : "Create an invitation when you are ready to give this client portal access."}
              </p>

              <div className="flex shrink-0 flex-col gap-2 min-[420px]:flex-row">
                {hasPendingInvitation &&
                latestInvitation ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={
                      handleRevokeInvitation
                    }
                    className="w-full min-[420px]:w-auto"
                  >
                    <XCircle className="size-4" />
                    Revoke invitation
                  </Button>
                ) : null}

                {canInvite ? (
                  <Button
                    type="button"
                    disabled={
                      isPending || !email
                    }
                    onClick={
                      handleSendInvitation
                    }
                    className="w-full min-[420px]:w-auto"
                  >
                    {isPending ? (
                      <RefreshCw className="size-4 animate-spin motion-reduce:animate-none" />
                    ) : (
                      <Mail className="size-4" />
                    )}

                    {isPending
                      ? "Working..."
                      : hasPendingInvitation
                        ? "Resend invitation"
                        : "Send invitation"}
                  </Button>
                ) : null}
              </div>
            </div>

            {!email ? (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-warning/25 bg-warning/5 px-3 py-2.5 text-sm">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />

                <p className="text-muted-foreground">
                  Add an email address before
                  creating a portal invitation.
                </p>
              </div>
            ) : null}

            {message ? (
              <div
                role="status"
                className={`mt-3 flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm ${
                  isError
                    ? "border-destructive/20 bg-destructive/[0.04]"
                    : "border-success/20 bg-success/[0.04]"
                }`}
              >
                {isError ? (
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                ) : (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                )}

                <p
                  className={
                    isError
                      ? "text-destructive"
                      : "text-foreground"
                  }
                >
                  {message}
                </p>
              </div>
            ) : null}

            {testInviteUrl ? (
              <div className="mt-3 rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Development invitation link
                </p>

                <div className="mt-2 flex flex-col gap-2 min-[560px]:flex-row">
                  <div className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs">
                    <p className="break-all">
                      {testInviteUrl}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={
                        handleCopyLink
                      }
                      className="flex-1 min-[560px]:flex-none"
                    >
                      {copied ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}

                      {copied
                        ? "Copied"
                        : "Copy"}
                    </Button>

                    <Button
                      nativeButton={false}
                      variant="outline"
                      render={
                        <a
                          href={
                            testInviteUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        />
                      }
                      className="flex-1 min-[560px]:flex-none"
                    >
                      <ExternalLink className="size-4" />
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

type PortalInfoProps = {
  icon: typeof Mail;
  label: string;
  value: string;
  badge?: {
    text: string;
    tone:
      | "neutral"
      | "info"
      | "success"
      | "warning"
      | "danger";
  };
};

function PortalInfo({
  icon: Icon,
  label,
  value,
  badge,
}: PortalInfoProps) {
  return (
    <div className="flex min-w-0 gap-3 px-4 py-4 tablet:px-5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>

        {badge ? (
          <StatusBadge
            tone={badge.tone}
            className="mt-1.5"
          >
            {badge.text}
          </StatusBadge>
        ) : (
          <p className="mt-1 break-words text-sm font-medium">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}