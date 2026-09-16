import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getClientsForUser } from "@/services/client.service";
import { getOrganizationForUser } from "@/services/organization.service";

export default async function ClientsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const organization =
    await getOrganizationForUser(session.user.id);

  if (!organization) {
    redirect("/onboarding/firm");
  }

  const clients = await getClientsForUser(
    session.user.id
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Clients
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage taxpayers for your practice.
          </p>
        </div>

        <Link
          href="/clients/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="mt-8 rounded-lg border p-6">
          <p>No clients have been added yet.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {clients.map((client) => {
            const name =
              client.type === "INDIVIDUAL"
                ? `${client.firstName ?? ""} ${
                    client.lastName ?? ""
                  }`.trim()
                : client.businessName ??
                  "Unnamed Business";

            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="block rounded-lg border p-4"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="font-medium">
                      {name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                      {client.email}
                    </p>
                  </div>

                  <div className="text-right text-sm">
                    <p>
                      {client.type === "INDIVIDUAL"
                        ? "Individual"
                        : "Business"}
                    </p>

                    <p className="text-gray-500">
                      Tax Year {client.taxYear}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}