import type { ReactNode } from "react";

import { AdminHeader } from "@/components/taxready/admin-header";
import { AdminSidebar } from "@/components/taxready/admin-sidebar";
import { AppFooter } from "@/components/taxready/app-footer";
import type { TaxReadyNotification } from "@/services/notification.service";

type AdminShellProps = {
  children: ReactNode;
  userName?: string;
  userEmail?: string;
  notifications?: TaxReadyNotification[];
};

export function AdminShell({
  children,
  userName,
  userEmail,
  notifications = [],
}: AdminShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AdminHeader
        userName={userName}
        userEmail={userEmail}
        notifications={notifications}
      />

      <div className="flex flex-1 items-stretch">
        <aside className="hidden w-[276px] shrink-0 border-r border-border bg-background desktop:block">
          <AdminSidebar />
        </aside>

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      <AppFooter />
    </div>
  );
}