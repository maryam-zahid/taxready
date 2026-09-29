import Link from "next/link";
import { headers } from "next/headers";
import {
  notFound,
  redirect,
} from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getClientForUser } from "@/services/client.service";
import { getClientTaxProfileForUser } from "@/services/client-tax-profile.service";

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
    id,
  );

  if (!client) {
    notFound();
  }

  const existingProfile =
    await getClientTaxProfileForUser(
      session.user.id,
      client.id,
    );

  const clientName =
    client.type === "INDIVIDUAL"
      ? `${client.firstName ?? ""} ${
          client.lastName ?? ""
        }`.trim() || "Unnamed client"
      : client.businessName ??
        "Business Client";

  const clientType =
    client.type === "INDIVIDUAL"
      ? "Individual"
      : "Business";

  return (
    <main className="w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-7">
      <Button
        nativeButton={false}
        variant="ghost"
        size="sm"
        render={
          <Link href={`/clients/${client.id}`} />
        }
        className="-ml-2 mb-3"
      >
        <ArrowLeft className="size-4" />
        Back to client
      </Button>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserRound className="size-[18px]" />
                </span>

                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                  Client tax profile
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-foreground sm:text-3xl">
                Tax Information Profile
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Select the areas that apply to this client.
                TaxReady uses this information to determine
                the preparation requirements and supporting
                documents needed.
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
              <div className="rounded-xl border bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserRound className="size-3.5" />
                  Client
                </div>

                <p className="mt-1 max-w-[190px] truncate text-sm font-semibold text-foreground">
                  {clientName}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {clientType}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  Tax year
                </div>

                <p className="mt-1 text-sm font-semibold text-foreground">
                  {client.taxYear}
                </p>

                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <BadgeCheck className="size-3" />
                  Preparation profile
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4">
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
                      (item) => item.type,
                    ),

                  declaredIncomeAmounts:
                    Object.fromEntries(
                      existingProfile.incomeSources.map(
                        (item) => [
                          item.type,
                          item.declaredAmount === null
                            ? null
                            : Number(
                                item.declaredAmount,
                              ),
                        ],
                      ),
                    ),

                  assetTypes:
                    existingProfile.assetTypes.map(
                      (item) => item.type,
                    ),

                  taxEvidenceTypes:
                    existingProfile.taxEvidenceTypes.map(
                      (item) => item.type,
                    ),

                  hasLiabilities:
                    existingProfile.hasLiabilities,

                  hasMultipleEmployers:
                    existingProfile.hasMultipleEmployers,

                  openingWealth:
                    existingProfile.openingWealth ===
                    null
                      ? null
                      : Number(
                          existingProfile.openingWealth,
                        ),

                  wealthAdditions:
                    existingProfile.wealthAdditions ===
                    null
                      ? null
                      : Number(
                          existingProfile.wealthAdditions,
                        ),

                  wealthReductions:
                    existingProfile.wealthReductions ===
                    null
                      ? null
                      : Number(
                          existingProfile.wealthReductions,
                        ),

                  closingWealth:
                    existingProfile.closingWealth ===
                    null
                      ? null
                      : Number(
                          existingProfile.closingWealth,
                        ),

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