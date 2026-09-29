"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

import { TaxReadyLogo } from "@/components/taxready/taxready-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { label: "Features", href: "/#features" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Client experience", href: "/#services" },
  { label: "Security", href: "/#security" },
  { label: "Help", href: "/help" },
];

type SiteHeaderProps = {
  variant?: "transparent" | "light";
};

export function SiteHeader({
  variant = "transparent",
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  const isLight = variant === "light";

  return (
    <header
      className={[
        "inset-x-0 top-0 z-50 w-full",
        isLight
          ? "relative border-b border-slate-200 bg-white"
          : "absolute bg-transparent",
      ].join(" ")}
    >
<div className="flex h-[60px] w-full items-center px-4 sm:px-5 lg:px-6">        {/* LOGO */}
        <div className="shrink-0">
          <TaxReadyLogo
            href="/"
            light={!isLight}
          />
        </div>

        {/* DESKTOP NAVIGATION */}
        <div className="ml-auto hidden items-center gap-5 desktop:flex">
          <nav
            aria-label="Public navigation"
            className="flex items-center gap-1"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2",
                  isLight
                    ? "text-muted-foreground hover:bg-slate-100 hover:text-foreground focus-visible:ring-primary/30"
                    : "text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-white/35",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div
            className={[
              "h-6 w-px",
              isLight
                ? "bg-slate-200"
                : "bg-white/20",
            ].join(" ")}
          />

          {/* DESKTOP ACTIONS */}
          <div className="flex items-center gap-2.5">
            {isLight ? (
              <>
                <Button
                  nativeButton={false}
                  variant="outline"
                  className="h-10 border-slate-200 bg-white px-4 text-foreground shadow-none hover:bg-slate-50 hover:text-foreground"
                  render={<Link href="/login" />}
                >
                  Sign in
                </Button>

                <Button
                  nativeButton={false}
                  className="h-10 bg-primary px-5 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                  render={<Link href="/register" />}
                >
                  Get started
                </Button>
              </>
            ) : (
              <>
                <Button
                  nativeButton={false}
                  variant="outline"
                  className="h-10 border-white/40 bg-transparent px-4 text-white shadow-none hover:border-white/70 hover:bg-white/10 hover:text-white"
                  render={<Link href="/login" />}
                >
                  Sign in
                </Button>

                <Button
                  nativeButton={false}
                  className="h-10 border border-white bg-white px-5 font-semibold text-primary shadow-sm hover:bg-white/90 hover:text-primary"
                  render={<Link href="/register" />}
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>

        {/* TABLET / MOBILE */}
        <div className="ml-auto desktop:hidden">
          <Sheet
            open={open}
            onOpenChange={setOpen}
          >
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    isLight
                      ? "text-foreground hover:bg-slate-100 hover:text-foreground"
                      : "text-white hover:bg-white/10 hover:text-white"
                  }
                  aria-label="Open navigation"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[310px] max-w-[88vw] gap-0 p-0"
            >
              <SheetTitle className="sr-only">
                TaxReady navigation
              </SheetTitle>

              {/* MOBILE DRAWER HEADER */}
              <div className="bg-primary px-5 py-4">
                <TaxReadyLogo
                  href="/"
                  light
                />
              </div>

              {/* MOBILE DRAWER CONTENT */}
              <div className="flex flex-col p-4">
                <nav
                  aria-label="Mobile public navigation"
                  className="space-y-1"
                >
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="my-4 border-t border-slate-200" />

                <div className="grid gap-2.5">
                  <Button
                    nativeButton={false}
                    variant="outline"
                    className="w-full"
                    render={
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                      />
                    }
                  >
                    Sign in
                  </Button>

                  <Button
                    nativeButton={false}
                    className="w-full"
                    render={
                      <Link
                        href="/register"
                        onClick={() => setOpen(false)}
                      />
                    }
                  >
                    Get started
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}