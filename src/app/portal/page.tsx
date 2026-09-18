import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ClientPortalPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const portalAccess =
    await prisma.clientPortalAccess.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            businessName: true,
            type: true,
            taxYear: true,
          },
        },
      },
    });

  if (
    !portalAccess ||
    portalAccess.status !== "ACTIVE"
  ) {
    redirect("/login");
  }

  const clientName =
    portalAccess.client.type === "BUSINESS"
      ? portalAccess.client.businessName
      : [
          portalAccess.client.firstName,
          portalAccess.client.lastName,
        ]
          .filter(Boolean)
          .join(" ");

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: 32,
      }}
    >
      <p>TaxReady Client Portal</p>

      <h1>Welcome, {clientName || "Client"}</h1>

      <p>
        Tax Year {portalAccess.client.taxYear}
      </p>

      <p>
        Your secure portal has been activated
        successfully.
      </p>
    </main>
  );
}