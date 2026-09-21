import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getClientTaxProfileForUser } from "@/services/client-tax-profile.service";
import { auth } from "@/lib/auth";
import { getClientForUser } from "@/services/client.service";

import { TaxProfileForm } from "./tax-profile-form";

type TaxProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TaxProfilePage({
  params,
}: TaxProfilePageProps) {
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
  const existingProfile =
  await getClientTaxProfileForUser(
    session.user.id,
    client.id
  );

  const clientName =
    client.type === "INDIVIDUAL"
      ? `${client.firstName ?? ""} ${
          client.lastName ?? ""
        }`.trim()
      : client.businessName ??
        "Business Client";

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link
        href={`/clients/${client.id}`}
        className="underline"
      >
        Back to Client
      </Link>

      <div className="mt-6">
        <h1 className="text-2xl font-bold">
          Tax Information Profile
        </h1>

        <p className="mt-2">
          {clientName} •{" "}
          {client.type === "INDIVIDUAL"
            ? "Individual"
            : "Business"}{" "}
          • Tax Year {client.taxYear}
        </p>

        <p className="mt-1 text-sm">
          Select the areas that apply to this
          client. TaxReady will use this profile
          to determine the information and
          documents required for preparation.
        </p>
      </div>

      <div className="mt-8">
       <TaxProfileForm
  clientId={client.id}
  initialData={
    existingProfile
      ? {
          filingHistoryStatus:
            existingProfile.filingHistoryStatus,

          previousTaxReturnAvailable:
            existingProfile.previousTaxReturnAvailable,

          previousWealthStatementAvailable:
            existingProfile.previousWealthStatementAvailable,

          incomeSources:
            existingProfile.incomeSources.map(
              (item) => item.type
            ),

          assetTypes:
            existingProfile.assetTypes.map(
              (item) => item.type
            ),

          taxEvidenceTypes:
            existingProfile.taxEvidenceTypes.map(
              (item) => item.type
            ),

          hasLiabilities:
            existingProfile.hasLiabilities,

          hasMultipleEmployers:
            existingProfile.hasMultipleEmployers,

          internalNotes:
            existingProfile.internalNotes ?? "",
        }
      : null
  }
/>
      </div>
    </main>
  );
}