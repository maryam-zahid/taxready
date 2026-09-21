"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CircleAlert,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const mainNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Requests",
    href: "/requests",
    icon: ClipboardList,
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    name: "Exceptions",
    href: "/exceptions",
    icon: CircleAlert,
  },
];

const accountNavigation = [
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

type AdminSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  className,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/25"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
            T
          </span>

          <span className="text-[19px] font-semibold tracking-[-0.03em] text-foreground">
            TaxReady
          </span>
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-5">
        <nav aria-label="Main navigation">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Overview
          </p>

          <div className="space-y-1">
            {mainNavigation.map((item) => {
              const active = isActiveRoute(
                pathname,
                item.href,
              );

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={cn(
                    "group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/25",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0 transition-colors duration-150",
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                    strokeWidth={1.9}
                  />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="my-5 border-t border-sidebar-border" />

        <nav aria-label="Account navigation">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Account
          </p>

          <div className="space-y-1">
            {accountNavigation.map((item) => {
              const active = isActiveRoute(
                pathname,
                item.href,
              );

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={cn(
                    "group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/25",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0 transition-colors duration-150",
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                    strokeWidth={1.9}
                  />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mt-auto pt-6">
          <div className="rounded-xl border border-sidebar-border bg-muted/45 px-3.5 py-3">
            <p className="truncate text-sm font-medium text-foreground">
              Tax practice
            </p>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Practice workspace
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}