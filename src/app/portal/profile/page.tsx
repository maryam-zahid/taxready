import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Building2, Mail, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getClientPortalContext } from "@/services/client-portal.service";

export default async function ClientProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  let portalAccess;

  try {
    portalAccess = await getClientPortalContext(session.user.id);
  } catch {
    redirect("/login");
  }

  const client = portalAccess.client;

  const clientName =
    client.type === "BUSINESS"
      ? client.businessName
      : [client.firstName, client.lastName]
          .filter(Boolean)
          .join(" ");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">
          Client account
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          View your account details and the tax practice managing
          your requests.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5 text-primary" />
              Profile information
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {client.type === "BUSINESS"
                  ? "Business name"
                  : "Full name"}
              </p>

              <p className="mt-1 text-sm font-medium">
                {clientName || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Client type
              </p>

              <p className="mt-1 text-sm font-medium">
                {client.type === "BUSINESS"
                  ? "Business"
                  : "Individual"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Email address
              </p>

              <p className="mt-1 break-all text-sm font-medium">
                {client.email || session.user.email || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Tax year
              </p>

              <p className="mt-1 text-sm font-medium">
                {client.taxYear}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Your tax practice
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Practice name
              </p>

              <p className="mt-1 text-sm font-medium">
                {client.organization.name}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" />

                <p className="text-xs leading-5 text-muted-foreground">
                  If any of your profile details need updating,
                  please contact your tax practice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}