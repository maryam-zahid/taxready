"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleAlert,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ScrollText,
  Settings,
  UserRound,
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
  {
  name: "Audit Log",
  href: "/audit-log",
  icon: ScrollText,
},
];

const accountNavigation = [
  {
    name: "Profile",
    href: "/profile",
    icon: UserRound,
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

function NavigationItem({
  item,
  active,
  onNavigate,
}: {
item:
  | (typeof mainNavigation)[number]
  | (typeof accountNavigation)[number];
    active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/25",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
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
     

<div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-5">
            <nav aria-label="Main navigation">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Overview
          </p>

          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <NavigationItem
                key={item.href}
                item={item}
                active={isActiveRoute(pathname, item.href)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </nav>

        <div className="my-5 border-t border-sidebar-border" />

       <nav aria-label="Account navigation">
  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
    Account
  </p>

  <div className="space-y-1">
    {accountNavigation.map((item) => (
      <NavigationItem
        key={item.href}
        item={item}
        active={isActiveRoute(pathname, item.href)}
        onNavigate={onNavigate}
      />
    ))}
  </div>
</nav>

        
      </div>
    </aside>
  );
}