"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

const portalNavigation = [
  {
    name: "Dashboard",
    href: "/portal",
    icon: LayoutDashboard,
  },
  {
    name: "My Requests",
    href: "/portal/requests",
    icon: ClipboardList,
  },
];

const accountNavigation = [
  {
    name: "My Profile",
    href: "/portal/profile",
    icon: UserRound,
  },
];

type ClientPortalSidebarProps = {
  practiceName?: string;
  className?: string;
  onNavigate?: () => void;
};

function isActiveRoute(
  pathname: string,
  href: string,
) {
  if (href === "/portal") {
    return pathname === "/portal";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

type NavigationItemProps = {
  item:
    | (typeof portalNavigation)[number]
    | (typeof accountNavigation)[number];
  active: boolean;
  onNavigate?: () => void;
};

function NavigationItem({
  item,
  active,
  onNavigate,
}: NavigationItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/25",
        active
          ? "bg-primary/10 text-primary"
          : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0",
          active
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        )}
        strokeWidth={1.8}
      />

      <span>{item.name}</span>
    </Link>
  );
}

export function ClientPortalSidebar({
  practiceName: _practiceName,
  className,
  onNavigate,
}: ClientPortalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col px-3 py-5">
        <nav aria-label="Client portal navigation">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Client portal
          </p>

          <div className="space-y-1">
            {portalNavigation.map((item) => (
              <NavigationItem
                key={item.href}
                item={item}
                active={isActiveRoute(
                  pathname,
                  item.href,
                )}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </nav>

        <div className="my-5 border-t border-sidebar-border" />

        <nav aria-label="Client account navigation">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Account
          </p>

          <div className="space-y-1">
            {accountNavigation.map((item) => (
              <NavigationItem
                key={item.href}
                item={item}
                active={isActiveRoute(
                  pathname,
                  item.href,
                )}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </nav>

        <div className="mt-auto pt-8">
          <div className="border-t border-sidebar-border px-3 pt-5">
            <p className="text-sm font-semibold text-foreground">
              TaxReady
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Secure client workspace
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}