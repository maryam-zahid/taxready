import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/taxready/admin-shell";
import { auth } from "@/lib/auth";
import { getAdminProfile } from "@/services/auth-profile.service";
import { getOrganizationForUser } from "@/services/organization.service";
import { getAdminNotifications } from "@/services/notification.service";
type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profile, organization] = await Promise.all([
    getAdminProfile(session.user.id),
    getOrganizationForUser(session.user.id),
  ]);

  if (!profile) {
    redirect("/onboarding/profile");
  }

  if (!organization) {
    redirect("/onboarding/firm");
  }

  const userName =
    `${profile.firstName} ${profile.lastName ?? ""}`.trim();

    const notifications = await getAdminNotifications(organization.id);
  return (
   <AdminShell
  userName={userName}
  userEmail={session.user.email}
  notifications={notifications}
>
  {children}
</AdminShell>
  );
}