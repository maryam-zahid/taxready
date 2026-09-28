import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ClipboardList,
  FileText,
  Search,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/taxready/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrganizationForUser } from "@/services/organization.service";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function getClientName(client: {
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  email: string;
}) {
  if (client.businessName?.trim()) {
    return client.businessName;
  }

  const fullName = [
    client.firstName,
    client.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || client.email;
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const organization = await getOrganizationForUser(
    session.user.id,
  );

  if (!organization) {
    redirect("/onboarding/firm");
  }

  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const hasQuery = query.length > 0;

  const [clients, requests, documents] = hasQuery
    ? await Promise.all([
        prisma.client.findMany({
          where: {
            organizationId: organization.id,
            OR: [
              {
                firstName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                businessName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                contactPerson: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                phone: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                ntn: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
            ntn: true,
            type: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 8,
        }),

        prisma.clientRequest.findMany({
          where: {
            client: {
              organizationId: organization.id,
            },
            OR: [
              {
                subject: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                message: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                client: {
                  OR: [
                    {
                      firstName: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                    {
                      lastName: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                    {
                      businessName: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                    {
                      email: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            ],
          },
          select: {
            id: true,
            subject: true,
            status: true,
            dueAt: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                businessName: true,
                email: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 8,
        }),

        prisma.document.findMany({
          where: {
            organizationId: organization.id,
            OR: [
              {
                fileName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                client: {
                  OR: [
                    {
                      firstName: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                    {
                      lastName: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                    {
                      businessName: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                    {
                      email: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            ],
          },
          select: {
            id: true,
            fileName: true,
            status: true,
            uploadedAt: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                businessName: true,
                email: true,
              },
            },
          },
          orderBy: {
            uploadedAt: "desc",
          },
          take: 8,
        }),
      ])
    : [[], [], []];

  const totalResults =
    clients.length +
    requests.length +
    documents.length;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          title="Search"
          description="Find clients, requests, and documents across your TaxReady workspace."
        />

        <form
          action="/search"
          className="relative max-w-2xl"
        >
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
          />

          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by client, email, NTN, request, or document..."
            className="h-11 bg-background pl-10 pr-24"
            autoFocus
          />

          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
          >
            Search
          </Button>
        </form>

        {!hasQuery ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="size-5 text-primary" />
              </span>

              <h2 className="mt-4 text-base font-semibold">
                Search your workspace
              </h2>

              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                Enter a client name, email, NTN, request
                subject, or document filename.
              </p>
            </CardContent>
          </Card>
        ) : totalResults === 0 ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Search className="size-5 text-muted-foreground" />
              </span>

              <h2 className="mt-4 text-base font-semibold">
                No results found
              </h2>

              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                No clients, requests, or documents matched
                &quot;{query}&quot;. Try another search term.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {totalResults}{" "}
              {totalResults === 1
                ? "result"
                : "results"}{" "}
              found for{" "}
              <span className="font-medium text-foreground">
                &quot;{query}&quot;
              </span>
            </p>

            {clients.length > 0 && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="size-[18px] text-primary" />
                    Clients
                    <span className="text-sm font-normal text-muted-foreground">
                      ({clients.length})
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  {clients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/clients/${client.id}`}
                      className="flex items-center justify-between gap-4 border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40 sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {getClientName(client)}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {client.email}
                          {client.ntn
                            ? ` • NTN ${client.ntn}`
                            : ""}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        {client.type === "BUSINESS"
                          ? "Business"
                          : "Individual"}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {requests.length > 0 && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="size-[18px] text-primary" />
                    Requests
                    <span className="text-sm font-normal text-muted-foreground">
                      ({requests.length})
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  {requests.map((request) => (
                    <Link
                      key={request.id}
                      href={`/clients/${request.client.id}`}
                      className="flex items-center justify-between gap-4 border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40 sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {request.subject}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {getClientName(request.client)}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {request.status
                          .replaceAll("_", " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (letter) =>
                            letter.toUpperCase(),
                          )}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {documents.length > 0 && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="size-[18px] text-primary" />
                    Documents
                    <span className="text-sm font-normal text-muted-foreground">
                      ({documents.length})
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  {documents.map((document) => (
                    <Link
                      key={document.id}
                      href={`/documents/${document.id}`}
                      className="flex items-center justify-between gap-4 border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40 sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {document.fileName}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {getClientName(document.client)}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {document.status
                          .replaceAll("_", " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (letter) =>
                            letter.toUpperCase(),
                          )}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}