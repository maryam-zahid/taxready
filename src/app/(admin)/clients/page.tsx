import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Plus, Search } from "lucide-react";

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
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b px-4 py-3.5 tablet:flex-row tablet:items-center tablet:justify-between">
            <div className="relative w-full tablet:max-w-sm">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.8}
              />

              <Input
                type="search"
                placeholder="Search clients..."
                aria-label="Search clients"
                className="h-9 bg-background pl-9 shadow-none"
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
              <div className="hidden tablet:block">
                <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(150px,0.7fr)_120px] gap-5 border-b bg-muted/25 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  <span>Client</span>
                  <span>Type</span>
                  <span>Tax year</span>
                </div>

                <div className="divide-y">
                  {clients.map((client) => {
                    const name =
                      client.type === "INDIVIDUAL"
                        ? `${client.firstName ?? ""} ${
                            client.lastName ?? ""
                          }`.trim() || "Unnamed client"
                        : (client.businessName ?? "Unnamed business");

                    const isIndividual =
                      client.type === "INDIVIDUAL";

                    return (
                      <Link
                        key={client.id}
                        href={`/clients/${client.id}`}
                        className="grid min-h-[68px] grid-cols-[minmax(0,1.8fr)_minmax(150px,0.7fr)_120px] items-center gap-5 px-5 py-3 transition-colors hover:bg-muted/35 focus-visible:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/20"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {name}
                          </p>

                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {client.email}
                          </p>
                        </div>

                        <div>
                          <StatusBadge>
                            {isIndividual
                              ? "Individual"
                              : "Business"}
                          </StatusBadge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {client.taxYear}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="divide-y tablet:hidden">
                {clients.map((client) => {
                  const name =
                    client.type === "INDIVIDUAL"
                      ? `${client.firstName ?? ""} ${
                          client.lastName ?? ""
                        }`.trim() || "Unnamed client"
                      : (client.businessName ?? "Unnamed business");

                  const isIndividual =
                    client.type === "INDIVIDUAL";

                  return (
                    <Link
                      key={client.id}
                      href={`/clients/${client.id}`}
                      className="block px-4 py-4 transition-colors hover:bg-muted/35 focus-visible:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/20"
                    >
                      <p className="truncate text-sm font-medium text-foreground">
                        {name}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {client.email}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2.5">
                        <StatusBadge>
                          {isIndividual
                            ? "Individual"
                            : "Business"}
                        </StatusBadge>

                        <span className="text-xs text-muted-foreground">
                          Tax year {client.taxYear}
                        </span>
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
    <CardContent className="flex min-h-[320px] items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <h2 className="text-base font-semibold tracking-[-0.01em]">
          No clients yet
        </h2>

        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Add your first client to create their tax profile and begin the
          preparation workflow.
        </p>

        <div className="mt-5">
          <Button
            nativeButton={false}
            render={<Link href="/clients/new" />}
          >
            <Plus className="size-4" />
            Add client
          </Button>
        </div>
      </div>
    </CardContent>
  );
}