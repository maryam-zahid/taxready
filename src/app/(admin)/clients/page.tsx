import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Plus,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/taxready/page-header";
import { StatusBadge } from "@/components/taxready/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { getClientsForUser } from "@/services/client.service";

export default async function ClientsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const clients = await getClientsForUser(session.user.id);

  return (
    <div className="app-page">
      <PageHeader
        title="Clients"
        description="Manage taxpayers, tax profiles and preparation progress for your practice."
        actions={
          <Button
            nativeButton={false}

            render={<Link href="/clients/new" />}
          >
            <Plus className="size-4" />
            Add client
          </Button>
        }
      />

      <div className="mt-6">
        <Card className="overflow-hidden shadow-none">
          <div className="flex flex-col gap-3 border-b p-4 tablet:flex-row tablet:items-center tablet:justify-between">
            <div className="relative w-full tablet:max-w-sm">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                type="search"
                placeholder="Search clients..."
                aria-label="Search clients"
                className="pl-9"
              />
            </div>

            <p className="text-xs font-medium text-muted-foreground">
              {clients.length} {clients.length === 1 ? "client" : "clients"}
            </p>
          </div>

          {clients.length === 0 ? (
            <EmptyClients />
          ) : (
            <>
              {/* Desktop / tablet list */}
              <div className="hidden tablet:block">
                <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(150px,0.75fr)_120px_40px] gap-4 border-b bg-muted/35 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  <span>Client</span>
                  <span>Type</span>
                  <span>Tax year</span>
                  <span>
                    <span className="sr-only">Open</span>
                  </span>
                </div>

                <div className="divide-y">
                  {clients.map((client) => {
                    const name =
                      client.type === "INDIVIDUAL"
                        ? `${client.firstName ?? ""} ${
                            client.lastName ?? ""
                          }`.trim() || "Unnamed client"
                        : (client.businessName ?? "Unnamed business");

                    const isIndividual = client.type === "INDIVIDUAL";

                    return (
                      <Link
                        key={client.id}
                        href={`/clients/${client.id}`}
                        className="group grid min-h-[72px] grid-cols-[minmax(0,1.7fr)_minmax(150px,0.75fr)_120px_40px] items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                            {isIndividual ? (
                              <UserRound className="size-[17px]" />
                            ) : (
                              <Building2 className="size-[17px]" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {name}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {client.email}
                            </p>
                          </div>
                        </div>

                        <div>
                          <StatusBadge>
                            {isIndividual ? "Individual" : "Business"}
                          </StatusBadge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {client.taxYear}
                        </p>

                        <div className="flex justify-end">
                          <ArrowRight className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile list */}
              <div className="divide-y tablet:hidden">
                {clients.map((client) => {
                  const name =
                    client.type === "INDIVIDUAL"
                      ? `${client.firstName ?? ""} ${
                          client.lastName ?? ""
                        }`.trim() || "Unnamed client"
                      : (client.businessName ?? "Unnamed business");

                  const isIndividual = client.type === "INDIVIDUAL";

                  return (
                    <Link
                      key={client.id}
                      href={`/clients/${client.id}`}
                      className="group block p-4 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                          {isIndividual ? (
                            <UserRound className="size-[17px]" />
                          ) : (
                            <Building2 className="size-[17px]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {name}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {client.email}
                              </p>
                            </div>

                            <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <StatusBadge>
                              {isIndividual ? "Individual" : "Business"}
                            </StatusBadge>

                            <span className="text-xs text-muted-foreground">
                              Tax year {client.taxYear}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function EmptyClients() {
  return (
    <CardContent className="flex min-h-[360px] items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <Users className="size-5" />
        </div>

        <h2 className="mt-4 text-sm font-semibold">No clients yet</h2>

        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Add your first client to begin building their tax profile and
          compliance checklist.
        </p>
        <Button nativeButton={false} render={<Link href="/clients/new" />}>
          <Plus className="size-4" />
          Add client
        </Button>
      </div>
    </CardContent>
  );
}
