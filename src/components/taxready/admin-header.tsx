"use client";

import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

import { MobileNavigation } from "@/components/taxready/mobile-navigation";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AdminHeaderProps = {
  userName?: string;
  userEmail?: string;
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
}: AdminHeaderProps) {
  const initials = getInitials(userName);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="flex w-full items-center gap-2 px-4 tablet:gap-4 tablet:px-6 desktop:px-8">
        <MobileNavigation />

        <div className="relative hidden w-full max-w-[440px] tablet:block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.9}
          />

          <Input
            type="search"
            aria-label="Search TaxReady"
            placeholder="Search clients, requests, documents..."
            className="h-9 w-full bg-card pl-9 shadow-none"
          />
        </div>

        <div className="tablet:hidden">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Search"
                />
              }
            >
              <Search className="size-[19px]" />
            </TooltipTrigger>

            <TooltipContent>Search</TooltipContent>
          </Tooltip>
        </div>

        <div className="ml-auto flex items-center gap-1 tablet:gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  className="relative"
                />
              }
            >
              <Bell className="size-[19px]" />

              <span
                aria-hidden="true"
                className="absolute right-[9px] top-[8px] size-1.5 rounded-full bg-primary ring-2 ring-background"
              />
            </TooltipTrigger>

            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <div className="mx-1 hidden h-6 w-px bg-border tablet:block" />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="h-10 gap-2 rounded-lg px-1.5 tablet:px-2"
                  aria-label="Open account menu"
                />
              }
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="hidden max-w-[170px] text-left desktop:block">
                <p className="truncate text-sm font-medium leading-4 text-foreground">
                  {userName}
                </p>

                <p className="mt-0.5 truncate text-xs font-normal text-muted-foreground">
                  {userEmail}
                </p>
              </div>

              <ChevronDown className="hidden size-4 text-muted-foreground desktop:block" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56"
            >
              <div className="px-2 py-1.5">
                <p className="truncate text-sm font-medium">
                  {userName}
                </p>

                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {userEmail}
                </p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <UserRound className="size-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}