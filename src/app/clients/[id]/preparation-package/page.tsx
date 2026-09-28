import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getClientForUser } from "@/services/client.service";
import { getClientRequirementsForUser } from "@/services/compliance-requirement.service";
import { getOrganizationForUser } from "@/services/organization.service";
import { calculateClientReadiness } from "@/services/readiness.service";
import { PrintButton } from "./print-button";
type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "Not set";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function PreparationPackagePage({
  params,
}: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const organization = await getOrganizationForUser(
    session.user.id,
  );

  if (!organization) {
    redirect("/onboarding/firm");
  }

  const [client, requirements] = await Promise.all([
    getClientForUser(session.user.id, id),
    getClientRequirementsForUser(session.user.id, id),
  ]);

  if (!client) {
    notFound();
  }

  const readiness = await calculateClientReadiness({
    organizationId: organization.id,
    clientId: client.id,
  });

  const clientName =
    client.type === "INDIVIDUAL"
      ? `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() ||
        "Unnamed client"
      : client.businessName ?? "Unnamed business";

  const completedCount = requirements.filter(
    (requirement) => requirement.status === "COMPLETED",
  ).length;

  return (
    <main className="mx-auto max-w-4xl bg-white px-6 py-8 text-black sm:px-10 print:max-w-none print:p-0">
      <div className="mb-8 flex items-center justify-between gap-4 border-b pb-5 print:hidden">
        <div>
          <h1 className="text-xl font-semibold">
            Tax Preparation Package
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Review the package, then use Print → Save as PDF.
          </p>
        </div>

      <PrintButton />
      </div>

      <header className="border-b-2 border-black pb-5">
        <p className="text-sm font-semibold uppercase tracking-wider">
          {organization.name}
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Tax Preparation Checklist
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Tax Year {client.taxYear}
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-bold">
          Client Information
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <Info label="Client" value={clientName} />

          <Info
            label="Client type"
            value={
              client.type === "INDIVIDUAL"
                ? "Individual"
                : "Business"
            }
          />

          <Info
            label="Email"
            value={client.email || "Not provided"}
          />

          <Info
            label="Phone"
            value={client.phone || "Not provided"}
          />

          <Info
            label="NTN / Registration"
            value={client.ntn || "Not provided"}
          />

          <Info
            label="Internal deadline"
            value={formatDate(client.preparationDeadline)}
          />
        </div>
      </section>

      <section className="mt-8 border-y py-5">
        <h2 className="text-lg font-bold">
          Tax Readiness
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Metric
            label="Readiness"
            value={`${readiness.percentage}%`}
          />

          <Metric
            label="Status"
            value={formatLabel(readiness.status)}
          />

          <Metric
            label="Required complete"
            value={`${readiness.completedRequired}/${readiness.totalRequired}`}
          />

          <Metric
            label="Blocking exceptions"
            value={String(readiness.blockingExceptionCount)}
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-bold">
            Compliance Checklist
          </h2>

          <p className="text-sm text-gray-600">
            {completedCount} of {requirements.length} completed
          </p>
        </div>

        {requirements.length === 0 ? (
          <p className="mt-4 rounded-md border p-4 text-sm">
            No compliance requirements have been generated for this
            client.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden border">
            {requirements.map((requirement, index) => (
              <div
                key={requirement.id}
                className="grid grid-cols-[36px_minmax(0,1fr)_130px] gap-3 border-b px-4 py-3 text-sm last:border-b-0"
              >
                <span>{index + 1}.</span>

                <div>
                  <p className="font-semibold">
                    {
                      requirement.requirementDefinition
                        .title
                    }
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    Response:{" "}
                    {formatLabel(
                      requirement.requirementDefinition
                        .responseType,
                    )}
                  </p>
                </div>

                <p className="text-right font-medium">
                  {formatLabel(requirement.status)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-10 border-t pt-4 text-xs text-gray-500">
        <p>
          Generated by TaxReady for tax preparation readiness
          purposes.
        </p>

        <p className="mt-1">
          Generated: {formatDate(new Date())}
        </p>
      </footer>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}