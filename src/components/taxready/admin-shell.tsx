import type { ReactNode } from "react";

import { AdminHeader } from "@/components/taxready/admin-header";
import { AdminSidebar } from "@/components/taxready/admin-sidebar";

type AdminShellProps = {
  children: ReactNode;
  userName?: string;
  userEmail?: string;
};

export function AdminShell({
  children,
  userName,
  userEmail,
}: AdminShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-sidebar-border bg-sidebar desktop:flex">
        <AdminSidebar />
      </div>

      <div className="min-h-dvh desktop:pl-[240px]">
        <AdminHeader
          userName={userName}
          userEmail={userEmail}
        />

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}