import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getClientForUser } from "@/services/client.service";

type ClientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const client = await getClientForUser(
    session.user.id,
    id
  );

  if (!client) {
    notFound();
  }

  const clientName =
    client.type === "INDIVIDUAL"
      ? `${client.firstName ?? ""} ${
          client.lastName ?? ""
        }`.trim()
      : client.businessName ?? "Unnamed Business";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/clients"
        className="text-sm underline"
      >
        Back to Clients
      </Link>

      <h1 className="mt-5 text-2xl font-semibold">
        {clientName}
      </h1>

      <p className="mt-1 text-sm text-gray-600">
        {client.type === "INDIVIDUAL"
          ? "Individual Client"
          : "Business Client"}
      </p>

      <div className="mt-8 space-y-3 rounded-lg border p-5">
        <p>
          <strong>Email:</strong> {client.email}
        </p>

        {client.phone && (
          <p>
            <strong>Phone:</strong> {client.phone}
          </p>
        )}

        {client.ntn && (
          <p>
            <strong>NTN:</strong> {client.ntn}
          </p>
        )}

        <p>
          <strong>Tax Year:</strong>{" "}
          {client.taxYear}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {client.status}
        </p>
{client.preparationDeadline && (
  <p>
    <strong>
      Internal Preparation Deadline:
    </strong>{" "}
    {client.preparationDeadline
      .toISOString()
      .split("T")[0]}
  </p>
)}

<p>
  <strong>Portal Invitation:</strong>{" "}
  {client.sendPortalInvitation
    ? "Requested"
    : "Not Requested"}
</p>
        {client.type === "INDIVIDUAL" && (
          <>
            <p>
              <strong>Taxpayer Type:</strong>{" "}
              {client.taxpayerType}
            </p>

            {client.occupation && (
              <p>
                <strong>Occupation:</strong>{" "}
                {client.occupation}
              </p>
            )}
          </>
        )}

        {client.type === "BUSINESS" && (
          <>
            <p>
              <strong>Contact Person:</strong>{" "}
              {client.contactPerson}
            </p>

            <p>
              <strong>Entity Type:</strong>{" "}
              {client.entityType}
            </p>

            <p>
              <strong>Business Activity:</strong>{" "}
              {client.businessActivity}
            </p>
          </>
        )}
      </div>
    </main>
  );
}