"use client";

import { useState, useTransition } from "react";

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

function formatDate(value: Date | string | null) {
  if (!value) {
    return "—";
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
        part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

export function PortalAccess({
  clientId,
  email,
  portalAccess,
  latestInvitation,
}: PortalAccessProps) {
  const [isPending, startTransition] = useTransition();

  const [message, setMessage] = useState<string | null>(
    null,
  );

  const [testInviteUrl, setTestInviteUrl] = useState<
    string | null
  >(null);

  const portalStatus =
    portalAccess?.status ?? "NOT_INVITED";

  const canInvite =
    portalStatus !== "ACTIVE" &&
    portalStatus !== "DISABLED";

  const hasPendingInvitation =
    latestInvitation?.status === "PENDING";

  function handleSendInvitation() {
    setMessage(null);
    setTestInviteUrl(null);

    startTransition(async () => {
      try {
        const result =
          await sendClientInvitationAction(clientId);

        const inviteUrl = `${window.location.origin}/invite/${result.token}`;

        setTestInviteUrl(inviteUrl);

        setMessage(
          hasPendingInvitation
            ? "A new invitation has been created. The previous invitation is no longer valid."
            : "Portal invitation created successfully.",
        );
      } catch (error) {
        console.error(error);

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
    setTestInviteUrl(null);

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

        setMessage(
          "Unable to revoke the portal invitation.",
        );
      }
    });
  }

  return (
    <section
      style={{
        marginTop: 32,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 20,
            }}
          >
            Portal Access
          </h2>

          <p
            style={{
              marginTop: 6,
              marginBottom: 0,
              color: "#6b7280",
            }}
          >
            Manage this client&apos;s secure TaxReady
            portal access.
          </p>
        </div>

        <span
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 999,
            padding: "5px 10px",
            fontSize: 13,
          }}
        >
          {formatStatus(portalStatus)}
        </span>
      </div>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gap: 12,
        }}
      >
        <div>
          <strong>Email</strong>
          <div>{email || "No email available"}</div>
        </div>

        {portalAccess?.invitedAt && (
          <div>
            <strong>Last invited</strong>
            <div>
              {formatDate(portalAccess.invitedAt)}
            </div>
          </div>
        )}

        {portalAccess?.activatedAt && (
          <div>
            <strong>Activated</strong>
            <div>
              {formatDate(portalAccess.activatedAt)}
            </div>
          </div>
        )}

        {latestInvitation && (
          <>
            <div>
              <strong>Latest invitation</strong>
              <div>
                {formatStatus(
                  latestInvitation.status,
                )}
              </div>
            </div>

            <div>
              <strong>Expires</strong>
              <div>
                {formatDate(
                  latestInvitation.expiresAt,
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {canInvite && (
          <button
            type="button"
            disabled={isPending || !email}
            onClick={handleSendInvitation}
          >
            {isPending
              ? "Working..."
              : hasPendingInvitation
                ? "Resend Invitation"
                : "Send Portal Invitation"}
          </button>
        )}

        {hasPendingInvitation &&
          latestInvitation && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleRevokeInvitation}
            >
              Revoke Invitation
            </button>
          )}
      </div>

      {message && (
        <p
          style={{
            marginTop: 16,
            marginBottom: 0,
          }}
        >
          {message}
        </p>
      )}

      {testInviteUrl && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f9fafb",
            borderRadius: 8,
            overflowWrap: "anywhere",
          }}
        >
          <strong>Development invite link</strong>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            {testInviteUrl}
          </p>
        </div>
      )}
    </section>
  );
}