import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RequestResponseForm } from "./request-response-form";
import { auth } from "@/lib/auth";
import { getClientPortalRequestById } from "@/services/client-portal.service";

type RequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

export default async function RequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  let request;

  try {
    request = await getClientPortalRequestById(
      session.user.id,
      id,
    );
  } catch {
    notFound();
  }

  const definition =
    request.clientRequirement.requirementDefinition;

  const isReadOnly =
    request.status === "SUBMITTED" ||
    request.status === "COMPLETED";

  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: 32,
      }}
    >
      <Link href="/portal/requests">
        ← Back to requests
      </Link>

      <header
        style={{
          marginTop: 28,
          marginBottom: 28,
        }}
      >
        <p
          style={{
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          {getStatusLabel(request.status)}
        </p>

        <h1
          style={{
            marginTop: 0,
            marginBottom: 12,
          }}
        >
          {definition.title}
        </h1>

        {definition.description && (
          <p
            style={{
              lineHeight: 1.6,
            }}
          >
            {definition.description}
          </p>
        )}

        <p>
          {getResponseTypeLabel(
            definition.responseType,
          )}
        </p>

        {request.dueAt && (
          <p>
            Due: <strong>{formatDate(request.dueAt)}</strong>
          </p>
        )}
      </header>

      {request.message && (
        <section
          style={{
            marginBottom: 24,
            padding: 16,
            background: "#f9fafb",
            borderRadius: 10,
          }}
        >
          <strong>Message from your practice</strong>

          <p
            style={{
              marginBottom: 0,
              lineHeight: 1.6,
            }}
          >
            {request.message}
          </p>
        </section>
      )}

      {isReadOnly ? (
        <section
          style={{
            padding: 20,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            {request.status === "COMPLETED"
              ? "Request completed"
              : "Response submitted"}
          </h2>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            {request.status === "COMPLETED"
              ? "Your tax practice has completed the review of this request."
              : "Your response has been submitted to your tax practice for review."}
          </p>
        </section>
     ) : (
  <section
    style={{
      padding: 20,
      border: "1px solid #e5e7eb",
      borderRadius: 12,
    }}
  >
    <h2
      style={{
        marginTop: 0,
      }}
    >
      Complete this request
    </h2>

    <RequestResponseForm
      requestId={request.id}
      responseType={definition.responseType}
    />
  </section>
)}
    </main>
  );
}