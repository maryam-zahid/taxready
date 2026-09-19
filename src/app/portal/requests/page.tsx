import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  getClientPortalContext,
  getClientPortalRequests,
} from "@/services/client-portal.service";

function formatDate(date: Date | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status: string) {
  switch (status) {
    case "SENT":
      return "Needs Attention";

    case "VIEWED":
      return "In Progress";

    case "SUBMITTED":
      return "Submitted";

    case "COMPLETED":
      return "Completed";

    default:
      return status;
  }
}

function getResponseTypeLabel(responseType: string) {
  switch (responseType) {
    case "DOCUMENT":
      return "Document required";

    case "INFORMATION":
      return "Information required";

    case "DOCUMENT_OR_INFORMATION":
      return "Document or information required";

    default:
      return responseType;
  }
}

export default async function PortalRequestsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  let portalAccess;

  try {
    portalAccess = await getClientPortalContext(
      session.user.id,
    );
  } catch {
    redirect("/login");
  }

  const requests = await getClientPortalRequests(
    session.user.id,
  );

  const clientName =
    portalAccess.client.type === "BUSINESS"
      ? portalAccess.client.businessName
      : [
          portalAccess.client.firstName,
          portalAccess.client.lastName,
        ]
          .filter(Boolean)
          .join(" ");

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: 32,
      }}
    >
      <header
        style={{
          marginBottom: 32,
        }}
      >
        <Link href="/portal">
          ← Back to portal
        </Link>

        <p
          style={{
            marginTop: 24,
            marginBottom: 4,
          }}
        >
          TaxReady Client Portal
        </p>

        <h1
          style={{
            marginTop: 0,
            marginBottom: 8,
          }}
        >
          Requests
        </h1>

        <p
          style={{
            margin: 0,
          }}
        >
          {clientName || "Client"} · Tax Year{" "}
          {portalAccess.client.taxYear}
        </p>
      </header>

      {requests.length === 0 ? (
        <section
          style={{
            padding: 24,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            You&apos;re all caught up
          </h2>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            There are currently no requests requiring
            your attention.
          </p>
        </section>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          {requests.map((request) => {
            const definition =
              request.clientRequirement
                .requirementDefinition;

            return (
              <article
                key={request.id}
                style={{
                  padding: 20,
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
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
                    <p
                      style={{
                        marginTop: 0,
                        marginBottom: 8,
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {getStatusLabel(request.status)}
                    </p>

                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom: 8,
                        fontSize: 20,
                      }}
                    >
                      {definition.title}
                    </h2>

                    {definition.description && (
                      <p
                        style={{
                          marginTop: 0,
                          marginBottom: 12,
                        }}
                      >
                        {definition.description}
                      </p>
                    )}

                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                      }}
                    >
                      {getResponseTypeLabel(
                        definition.responseType,
                      )}
                    </p>
                  </div>

                  {request.dueAt && (
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        fontSize: 14,
                      }}
                    >
                      Due {formatDate(request.dueAt)}
                    </div>
                  )}
                </div>

                {request.message && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      background: "#f9fafb",
                      borderRadius: 8,
                    }}
                  >
                    <strong>Message from your practice</strong>

                    <p
                      style={{
                        marginBottom: 0,
                      }}
                    >
                      {request.message}
                    </p>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 16,
                  }}
                >
                  <Link
                    href={`/portal/requests/${request.id}`}
                  >
                    {request.status === "COMPLETED"
                      ? "View Request"
                      : request.status === "SUBMITTED"
                        ? "View Submission"
                        : "Complete Request"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}