import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/taxready/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrganizationAuditLogs } from "@/services/audit-log.service";
import { getOrganizationForUser } from "@/services/organization.service";

function formatAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function getActionBadgeVariant(
  action: string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (action) {
    case "DOCUMENT_REJECTED":
      return "destructive";

    case "DOCUMENT_APPROVED":
    case "CLIENT_MARKED_TAX_READY":
      return "default";

    default:
      return "outline";
  }
}

export default async function AuditLogPage() {
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
    redirect("/dashboard");
  }

  const auditLogs = await getOrganizationAuditLogs({
    organizationId: organization.id,
    limit: 100,
  });

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          title="Audit log"
          description="Track important client and compliance activity across your tax practice."
          actions={
            <Button
              nativeButton={false}
              render={<Link href="/clients" />}
            >
              View clients
            </Button>
          }
        />

        <Card className="overflow-hidden">
          <CardHeader className="border-b px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">
                  Recent activity
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Important actions recorded across your tax
                  practice.
                </p>
              </div>

              <span className="text-sm text-muted-foreground">
                {auditLogs.length}{" "}
                {auditLogs.length === 1 ? "event" : "events"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {auditLogs.length === 0 ? (
              <div className="px-5 py-12 text-center sm:px-6">
                <p className="text-sm font-medium text-foreground">
                  No activity recorded yet
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Important client and compliance actions will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="px-5 py-4 transition-colors hover:bg-muted/30 sm:px-6"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {log.description}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {log.clientName && (
                            <span className="text-xs text-muted-foreground">
                              {log.clientName}
                            </span>
                          )}

                          {log.clientName && (
                            <span className="text-xs text-muted-foreground">
                              ·
                            </span>
                          )}

                          <Badge
                            variant={getActionBadgeVariant(
                              log.action,
                            )}
                            className="h-5 px-1.5 text-[10px] font-medium"
                          >
                            {formatAction(log.action)}
                          </Badge>
                        </div>
                      </div>

                      <time
                        dateTime={log.createdAt.toISOString()}
                        className="shrink-0 text-xs text-muted-foreground"
                      >
                        {new Intl.DateTimeFormat("en-PK", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(log.createdAt)}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}