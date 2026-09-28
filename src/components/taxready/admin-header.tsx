// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import {
//   Bell,
//   ChevronDown,
//   LogOut,
//   Search,
//   Settings,
//   UserRound,
// } from "lucide-react";
// import { TaxReadyLogo } from "@/components/taxready/taxready-logo";
// import { MobileNavigation } from "@/components/taxready/mobile-navigation";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import { signOut } from "@/lib/auth-client";
// import type { TaxReadyNotification } from "@/services/notification.service";

// type AdminHeaderProps = {
//   userName?: string;
//   userEmail?: string;
//   notifications?: TaxReadyNotification[];
// };

// function getInitials(name?: string) {
//   if (!name?.trim()) {
//     return "TR";
//   }

//   return name
//     .trim()
//     .split(/\s+/)
//     .slice(0, 2)
//     .map((part) => part[0])
//     .join("")
//     .toUpperCase();
// }

// export function AdminHeader({
//   userName = "Tax Professional",
//   userEmail = "Practice account",
//   notifications = [],
// }: AdminHeaderProps) {
//   const router = useRouter();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [notificationItems, setNotificationItems] =
//     useState(notifications);
//   const [isSigningOut, setIsSigningOut] = useState(false);

//   const initials = getInitials(userName);

//   const unreadCount = notificationItems.filter(
//     (notification) => !notification.isRead,
//   ).length;

//   async function markAllNotificationsRead() {
//     const response = await fetch(
//       "/api/notifications/read-all",
//       {
//         method: "POST",
//       },
//     );

//     if (!response.ok) return;

//     setNotificationItems((current) =>
//       current.map((item) => ({
//         ...item,
//         isRead: true,
//       })),
//     );

//     router.refresh();
//   }

//   async function handleSignOut() {
//     if (isSigningOut) return;

//     setIsSigningOut(true);

//     try {
//       await signOut();
//       router.replace("/login");
//       router.refresh();
//     } catch (error) {
//       console.error("Sign out failed:", error);
//       setIsSigningOut(false);
//     }
//   }

//   function handleSearchSubmit(
//     event: React.FormEvent<HTMLFormElement>,
//   ) {
//     event.preventDefault();

//     const query = searchQuery.trim();

//     if (!query) return;

//     router.push(`/search?q=${encodeURIComponent(query)}`);
//   }

//  return (
//   <header className="sticky top-0 z-40 border-b border-primary-foreground/10 bg-primary text-primary-foreground shadow-sm">
//     <div className="flex min-h-16 w-full items-center">
//       {/* Brand area — matches desktop sidebar width */}
//       <div className="flex shrink-0 items-center gap-2 px-4 sm:px-5 desktop:w-[276px] desktop:px-6">
//         <div className="desktop:hidden">
//           <MobileNavigation />
//         </div>

//         <div className="hidden min-[390px]:block">
//           <TaxReadyLogo
//             href="/dashboard"
//             light
//           />
//         </div>

//         <div className="min-[390px]:hidden">
//           <TaxReadyLogo
//             href="/dashboard"
//             light
//             compact
//           />
//         </div>
//       </div>

//       {/* Header actions aligned with page content */}
//       <div className="flex min-w-0 flex-1 items-center gap-4 px-4 sm:px-6 desktop:px-0 desktop:pr-8">
//         <form
//           onSubmit={handleSearchSubmit}
//           className="relative hidden w-full max-w-[540px] sm:block"
//         >
//           <Search
//             aria-hidden="true"
//             className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-slate-500"
//             strokeWidth={1.9}
//           />

//           <Input
//             type="search"
//             value={searchQuery}
//             onChange={(event) =>
//               setSearchQuery(event.target.value)
//             }
//             aria-label="Search TaxReady"
//             placeholder="Search clients, requests, documents..."
//             className="h-10 rounded-xl border-white/90 bg-white pl-10 text-slate-900 shadow-sm placeholder:text-slate-500 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/30"
//           />
//         </form>

//         <div className="ml-auto flex shrink-0 items-center gap-1.5">
//           <DropdownMenu>
//             <DropdownMenuTrigger
//               render={
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   aria-label="Notifications"
//                   className="relative size-9 rounded-lg text-white hover:bg-white/10 hover:text-white"
//                 />
//               }
//             >
//               <Bell
//                 className="size-[19px]"
//                 strokeWidth={1.9}
//               />

//               {unreadCount > 0 && (
//                 <span className="absolute right-0 top-0 flex min-w-4 items-center justify-center rounded-full border-2 border-primary bg-white px-1 text-[8px] font-bold leading-3 text-primary">
//                   {unreadCount > 9
//                     ? "9+"
//                     : unreadCount}
//                 </span>
//               )}
//             </DropdownMenuTrigger>

//             <DropdownMenuContent
//               align="end"
//               className="w-[min(380px,calc(100vw-24px))] p-0"
//             >
//               <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
//                 <div>
//                   <p className="text-sm font-semibold">
//                     Notifications
//                   </p>

//                   <p className="mt-0.5 text-xs text-muted-foreground">
//                     {unreadCount > 0
//                       ? `${unreadCount} unread`
//                       : "You're all caught up"}
//                   </p>
//                 </div>

//                 {unreadCount > 0 && (
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     className="h-8 px-2 text-xs"
//                     onClick={markAllNotificationsRead}
//                   >
//                     Mark all read
//                   </Button>
//                 )}
//               </div>

//               {notificationItems.length === 0 ? (
//                 <div className="flex flex-col items-center px-5 py-9 text-center">
//                   <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
//                     <Bell className="size-5 text-muted-foreground" />
//                   </span>

//                   <p className="text-sm font-medium">
//                     No notifications
//                   </p>

//                   <p className="mt-1 max-w-60 text-xs leading-5 text-muted-foreground">
//                     Client submissions and required actions
//                     will appear here.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="max-h-[360px] overflow-y-auto p-1.5">
//                   {notificationItems.map(
//                     (notification) => (
//                       <DropdownMenuItem
//                         key={notification.id}
//                         render={
//                           <Link
//                             href={
//                               notification.href ??
//                               "/dashboard"
//                             }
//                             onClick={() => {
//                               if (notification.isRead) return;

//                               setNotificationItems(
//                                 (current) =>
//                                   current.map((item) =>
//                                     item.id === notification.id
//                                       ? {
//                                           ...item,
//                                           isRead: true,
//                                         }
//                                       : item,
//                                   ),
//                               );

//                               void fetch(
//                                 `/api/notifications/${notification.id}/read`,
//                                 {
//                                   method: "POST",
//                                 },
//                               );
//                             }}
//                           />
//                         }
//                         className={[
//                           "flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3",
//                           !notification.isRead
//                             ? "bg-muted/60"
//                             : "",
//                         ].join(" ")}
//                       >
//                         <span className="mt-1.5 flex size-2 shrink-0">
//                           {!notification.isRead && (
//                             <span
//                               className={[
//                                 "size-2 rounded-full",
//                                 notification.type === "warning"
//                                   ? "bg-amber-500"
//                                   : notification.type === "success"
//                                     ? "bg-emerald-500"
//                                     : "bg-primary",
//                               ].join(" ")}
//                             />
//                           )}
//                         </span>

//                         <span className="min-w-0 flex-1">
//                           <span className="block text-sm font-medium">
//                             {notification.title}
//                           </span>

//                           <span className="mt-0.5 block truncate text-xs text-muted-foreground">
//                             {notification.description}
//                           </span>
//                         </span>
//                       </DropdownMenuItem>
//                     ),
//                   )}
//                 </div>
//               )}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <div className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />

//           <DropdownMenu>
//             <DropdownMenuTrigger
//               render={
//                 <Button
//                   variant="ghost"
//                   className="h-10 gap-2 rounded-xl px-1.5 text-white hover:bg-white/10 hover:text-white sm:px-2"
//                   aria-label="Open account menu"
//                 />
//               }
//             >
//               <Avatar className="size-8 border border-white/20">
//                 <AvatarFallback className="bg-white/15 text-xs font-semibold text-white">
//                   {initials}
//                 </AvatarFallback>
//               </Avatar>

//               <div className="hidden max-w-[170px] text-left desktop:block">
//                 <p className="truncate text-sm font-semibold leading-4 text-white">
//                   {userName}
//                 </p>

//                 <p className="mt-0.5 truncate text-xs text-white/65">
//                   {userEmail}
//                 </p>
//               </div>

//               <ChevronDown className="hidden size-4 text-white/65 desktop:block" />
//             </DropdownMenuTrigger>

//             <DropdownMenuContent
//               align="end"
//               className="w-60"
//             >
//               <div className="px-2 py-2">
//                 <p className="truncate text-sm font-medium">
//                   {userName}
//                 </p>

//                 <p className="mt-0.5 truncate text-xs text-muted-foreground">
//                   {userEmail}
//                 </p>
//               </div>

//               <DropdownMenuSeparator />

//               <DropdownMenuItem
//                 render={<Link href="/profile" />}
//               >
//                 <UserRound className="size-4" />
//                 Profile
//               </DropdownMenuItem>

//               <DropdownMenuItem
//                 render={<Link href="/settings" />}
//               >
//                 <Settings className="size-4" />
//                 Settings
//               </DropdownMenuItem>

//               <DropdownMenuSeparator />

//               <DropdownMenuItem
//                 disabled={isSigningOut}
//                 className="text-destructive focus:text-destructive"
//                 onClick={() => {
//                   void handleSignOut();
//                 }}
//               >
//                 <LogOut className="size-4" />

//                 {isSigningOut
//                   ? "Signing out..."
//                   : "Sign out"}
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </div>

//     {/* Mobile search remains part of the same blue navbar */}
//     <div className="px-4 pb-3 sm:hidden">
//       <form
//         onSubmit={handleSearchSubmit}
//         className="relative"
//       >
//         <Search
//           aria-hidden="true"
//           className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-slate-500"
//           strokeWidth={1.9}
//         />

//         <Input
//           type="search"
//           value={searchQuery}
//           onChange={(event) =>
//             setSearchQuery(event.target.value)
//           }
//           aria-label="Search TaxReady"
//           placeholder="Search TaxReady..."
//           className="h-10 rounded-xl border-white bg-white pl-10 text-slate-900 shadow-sm placeholder:text-slate-500"
//         />
//       </form>
//     </div>
//   </header>
// );
// }
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import { MobileNavigation } from "@/components/taxready/mobile-navigation";
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
import { Input } from "@/components/ui/input";
import { signOut } from "@/lib/auth-client";
import type { TaxReadyNotification } from "@/services/notification.service";

type AdminHeaderProps = {
  userName?: string;
  userEmail?: string;
  notifications?: TaxReadyNotification[];
};

function getInitials(name?: string) {
  if (!name?.trim()) {
    return "TR";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AdminHeader({
  userName = "Tax Professional",
  userEmail = "Practice account",
  notifications = [],
}: AdminHeaderProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);
  const [notificationItems, setNotificationItems] =
    useState(notifications);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const initials = getInitials(userName);

  const unreadCount = notificationItems.filter(
    (notification) => !notification.isRead,
  ).length;

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

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  }

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    setMobileSearchOpen(false);

    router.push(
      `/search?q=${encodeURIComponent(query)}`,
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-primary-foreground/10 bg-primary text-primary-foreground shadow-sm">
      {/* Mobile */}
      <div className="sm:hidden">
        {!mobileSearchOpen ? (
          <div className="flex h-16 items-center gap-2 px-4">
            <MobileNavigation />

            <TaxReadyLogo
              href="/dashboard"
              light
            />

            <div className="ml-auto flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Search"
                className="size-9 rounded-lg text-white hover:bg-white/10 hover:text-white"
                onClick={() =>
                  setMobileSearchOpen(true)
                }
              >
                <Search
                  className="size-[18px]"
                  strokeWidth={1.9}
                />
              </Button>

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
                  className="w-[calc(100vw-24px)] max-w-[380px] p-0"
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
                        onClick={
                          markAllNotificationsRead
                        }
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
                        No notifications
                      </p>

                      <p className="mt-1 max-w-60 text-xs leading-5 text-muted-foreground">
                        Client submissions and required
                        actions will appear here.
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
                                  "/dashboard"
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
                                {
                                  notification.title
                                }
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

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="size-9 rounded-full p-0 text-white hover:bg-white/10 hover:text-white"
                      aria-label="Open account menu"
                    />
                  }
                >
                  <Avatar className="size-8 border border-white/20">
                    <AvatarFallback className="bg-white/15 text-xs font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-60"
                >
                  <div className="px-2 py-2">
                    <p className="truncate text-sm font-medium">
                      {userName}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    render={<Link href="/profile" />}
                  >
                    <UserRound className="size-4" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    render={<Link href="/settings" />}
                  >
                    <Settings className="size-4" />
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled={isSigningOut}
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      void handleSignOut();
                    }}
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
        ) : (
          <div className="flex h-16 items-center gap-2 px-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close search"
              className="size-9 shrink-0 rounded-lg text-white hover:bg-white/10 hover:text-white"
              onClick={() =>
                setMobileSearchOpen(false)
              }
            >
              <ArrowLeft className="size-5" />
            </Button>

            <form
              onSubmit={handleSearchSubmit}
              className="relative min-w-0 flex-1"
            >
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500"
              />

              <Input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                aria-label="Search TaxReady"
                placeholder="Search TaxReady..."
                className="h-10 rounded-xl border-white bg-white pl-10 pr-10 text-slate-900 shadow-sm placeholder:text-slate-500 focus-visible:border-white"
              />

              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  <X className="size-4" />
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Tablet + desktop */}
      <div className="hidden min-h-16 w-full items-center sm:flex">
        <div className="flex shrink-0 items-center gap-2 px-5 desktop:w-[276px] desktop:px-6">
          <div className="desktop:hidden">
            <MobileNavigation />
          </div>

          <TaxReadyLogo
            href="/dashboard"
            light
          />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-4 px-6 desktop:px-0 desktop:pr-8">
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full max-w-[540px]"
          >
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-slate-500"
              strokeWidth={1.9}
            />

            <Input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value,
                )
              }
              aria-label="Search TaxReady"
              placeholder="Search clients, requests, documents..."
              className="h-10 rounded-xl border-white/90 bg-white pl-10 text-slate-900 shadow-sm placeholder:text-slate-500 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/30"
            />
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
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
                  className="size-[19px]"
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
                      onClick={
                        markAllNotificationsRead
                      }
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
                      No notifications
                    </p>

                    <p className="mt-1 max-w-60 text-xs leading-5 text-muted-foreground">
                      Client submissions and required
                      actions will appear here.
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
                                "/dashboard"
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
                              {
                                notification.title
                              }
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

            <div className="mx-1 hidden h-6 w-px bg-white/20 desktop:block" />

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="h-10 gap-2 rounded-xl px-1.5 text-white hover:bg-white/10 hover:text-white desktop:px-2"
                    aria-label="Open account menu"
                  />
                }
              >
                <Avatar className="size-8 border border-white/20">
                  <AvatarFallback className="bg-white/15 text-xs font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden max-w-[170px] text-left desktop:block">
                  <p className="truncate text-sm font-semibold leading-4 text-white">
                    {userName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-white/65">
                    {userEmail}
                  </p>
                </div>

                <ChevronDown className="hidden size-4 text-white/65 desktop:block" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-60"
              >
                <div className="px-2 py-2">
                  <p className="truncate text-sm font-medium">
                    {userName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {userEmail}
                  </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  render={<Link href="/profile" />}
                >
                  <UserRound className="size-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  render={<Link href="/settings" />}
                >
                  <Settings className="size-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  disabled={isSigningOut}
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    void handleSignOut();
                  }}
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