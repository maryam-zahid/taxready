import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppFooter } from "@/components/taxready/app-footer";
import { ClientPortalHeader } from "@/components/taxready/client-portal-header";
import { ClientPortalSidebar } from "@/components/taxready/client-portal-sidebar";
import { auth } from "@/lib/auth";
import { getClientPortalContext } from "@/services/client-portal.service";
import { getClientNotifications } from "@/services/notification.service";

type ClientPortalLayoutProps = {
  children: React.ReactNode;
};

export default async function ClientPortalLayout({
  children,
}: ClientPortalLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  let portalAccess;

  try {
    portalAccess = await getClientPortalContext(
      session.user.id,
    );
  } catch {
    redirect("/login");
  }

  const client = portalAccess.client;

  const notifications =
    await getClientNotifications(client.id);

  const clientName =
    client.type === "BUSINESS"
      ? client.businessName
      : [client.firstName, client.lastName]
          .filter(Boolean)
          .join(" ");

  const resolvedClientName =
    clientName ||
    session.user.name ||
    "Client";

  const resolvedClientEmail =
    client.email ||
    session.user.email ||
    "";

  const practiceName =
    client.organization.name;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <ClientPortalHeader
        clientName={resolvedClientName}
        clientEmail={resolvedClientEmail}
        practiceName={practiceName}
        notifications={notifications}
      />

      <div className="flex flex-1 items-stretch">
        <aside className="hidden w-[276px] shrink-0 border-r border-border bg-sidebar desktop:block">
          <ClientPortalSidebar
            practiceName={practiceName}
          />
        </aside>

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      <AppFooter />
    </div>
  );
}