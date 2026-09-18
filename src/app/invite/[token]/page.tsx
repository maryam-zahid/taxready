import Link from "next/link";

import { getClientInvitationByToken } from "@/services/client-invitation.service";

import { InviteActivationForm } from "./invite-activation-form";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({
  params,
}: InvitePageProps) {
  const { token } = await params;

  try {
    const invitation =
      await getClientInvitationByToken(token);

    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#f9fafb",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: 480,
            padding: 32,
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            background: "#ffffff",
          }}
        >
          <p
            style={{
              marginTop: 0,
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            TaxReady
          </p>

          <h1
            style={{
              marginTop: 0,
              marginBottom: 12,
            }}
          >
            Activate your secure portal
          </h1>

          <p
            style={{
              color: "#6b7280",
              lineHeight: 1.6,
            }}
          >
            {invitation.practiceName} has invited you
            to TaxReady to securely provide the
            information and documents needed for your
            tax preparation.
          </p>

          <div
            style={{
              marginTop: 24,
              marginBottom: 24,
              padding: 16,
              borderRadius: 10,
              background: "#f9fafb",
            }}
          >
            <strong>{invitation.clientName}</strong>

            <div
              style={{
                marginTop: 4,
                color: "#6b7280",
              }}
            >
              {invitation.email}
            </div>
          </div>

          <InviteActivationForm
            token={token}
            email={invitation.email}
            clientName={invitation.clientName}
          />
        </section>
      </main>
    );
  } catch {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#f9fafb",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: 480,
            padding: 32,
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            background: "#ffffff",
          }}
        >
          <p
            style={{
              marginTop: 0,
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            TaxReady
          </p>

          <h1>Invitation unavailable</h1>

          <p
            style={{
              color: "#6b7280",
              lineHeight: 1.6,
            }}
          >
            This invitation is invalid, expired, or
            has already been used. Please contact your
            tax professional for a new invitation.
          </p>

          <Link href="/login">
            Go to login
          </Link>
        </section>
      </main>
    );
  }
}