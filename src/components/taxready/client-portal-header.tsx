"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  UserRound,
} from "lucide-react";

import { ClientPortalMobileNavigation } from "@/components/taxready/client-portal-mobile-navigation";
import { TaxReadyLogo } from "@/components/taxready/taxready-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { TaxReadyNotification } from "@/services/notification.service";

type ClientPortalHeaderProps = {
  clientName: string;
  clientEmail: string;
  practiceName: string;
  notifications?: TaxReadyNotification[];
};

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "TR";
}

export function ClientPortalHeader({
  clientName,
  clientEmail,
  practiceName,
  notifications = [],
}: ClientPortalHeaderProps) {
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  const [notificationItems, setNotificationItems] =
    useState(notifications);

  const unreadCount = notificationItems.filter(
    (notification) => !notification.isRead,
  ).length;

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  }

  async function markAllNotificationsRead() {
    const response = await fetch(
      "/api/notifications/read-all",
      {
        method: "POST",
      },
    );

    if (!response.ok) return;

    setNotificationItems((current) =>
      current.map((item) => ({
        ...item,
        isRead: true,
      })),
    );

    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-primary text-primary-foreground shadow-sm">
      <div className="flex h-16 w-full items-center">
        {/* Brand area */}
        <div className="flex shrink-0 items-center gap-2 px-4 sm:px-5 desktop:w-[276px] desktop:px-6">
          <ClientPortalMobileNavigation
            practiceName={practiceName}
          />

          <TaxReadyLogo
            href="/portal"
            light
          />
        </div>

        {/* Right area */}
        <div className="flex min-w-0 flex-1 items-center px-3 sm:px-5 desktop:px-0 desktop:pr-8">
          <div className="hidden min-w-0 desktop:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-white/55">
              Client portal
            </p>

            <p className="max-w-[240px] truncate text-xs font-medium text-white/90">
              {practiceName}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notifications"
                    className="relative size-9 rounded-lg text-white hover:bg-white/10 hover:text-white"
                  />
                }
              >
                <Bell
                  className="size-[18px]"
                  strokeWidth={1.9}
                />

                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0 flex min-w-4 items-center justify-center rounded-full border-2 border-primary bg-white px-1 text-[8px] font-bold leading-3 text-primary">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-[min(380px,calc(100vw-24px))] p-0"
              >
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">
                      Notifications
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : "You're all caught up"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => {
                        void markAllNotificationsRead();
                      }}
                    >
                      Mark all read
                    </Button>
                  )}
                </div>

                {notificationItems.length === 0 ? (
                  <div className="flex flex-col items-center px-5 py-9 text-center">
                    <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
                      <Bell className="size-5 text-muted-foreground" />
                    </span>

                    <p className="text-sm font-medium">
                      You&apos;re all caught up
                    </p>

                    <p className="mt-1 max-w-60 text-xs leading-5 text-muted-foreground">
                      New requests and required actions
                      will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[360px] overflow-y-auto p-1.5">
                    {notificationItems.map(
                      (notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          render={
                            <Link
                              href={
                                notification.href ??
                                "/portal"
                              }
                              onClick={() => {
                                if (
                                  notification.isRead
                                ) {
                                  return;
                                }

                                setNotificationItems(
                                  (current) =>
                                    current.map(
                                      (item) =>
                                        item.id ===
                                        notification.id
                                          ? {
                                              ...item,
                                              isRead:
                                                true,
                                            }
                                          : item,
                                    ),
                                );

                                void fetch(
                                  `/api/notifications/${notification.id}/read`,
                                  {
                                    method: "POST",
                                  },
                                );
                              }}
                            />
                          }
                          className={[
                            "flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3",
                            !notification.isRead
                              ? "bg-muted/60"
                              : "",
                          ].join(" ")}
                        >
                          <span className="mt-1.5 flex size-2 shrink-0">
                            {!notification.isRead && (
                              <span
                                className={[
                                  "size-2 rounded-full",
                                  notification.type ===
                                  "warning"
                                    ? "bg-amber-500"
                                    : notification.type ===
                                        "success"
                                      ? "bg-emerald-500"
                                      : "bg-primary",
                                ].join(" ")}
                              />
                            )}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">
                              {notification.title}
                            </span>

                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {
                                notification.description
                              }
                            </span>
                          </span>
                        </DropdownMenuItem>
                      ),
                    )}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />

            {/* Account */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="h-10 gap-2 rounded-xl px-1 text-white hover:bg-white/10 hover:text-white sm:px-1.5"
                    aria-label="Open account menu"
                  />
                }
              >
                <Avatar className="size-8 border border-white/20">
                  <AvatarFallback className="bg-white/15 text-xs font-semibold text-white">
                    {getInitials(clientName)}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden max-w-[180px] text-left desktop:block">
                  <p className="truncate text-sm font-semibold leading-4 text-white">
                    {clientName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-white/60">
                    Client account
                  </p>
                </div>

                <ChevronDown className="hidden size-4 text-white/60 desktop:block" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-60"
              >
                <div className="px-2 py-2">
                  <p className="truncate text-sm font-medium">
                    {clientName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {clientEmail}
                  </p>

                  <p className="mt-1 truncate text-[11px] text-muted-foreground">
                    {practiceName}
                  </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  render={
                    <Link href="/portal/profile" />
                  }
                >
                  <UserRound className="size-4" />
                  My Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  disabled={isSigningOut}
                  onClick={() => {
                    void handleSignOut();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />

                  {isSigningOut
                    ? "Signing out..."
                    : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}