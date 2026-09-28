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
  { label: "Features", href: "/features" },
  { label: "Services", href: "/services" },
  { label: "Security", href: "/security" },
  { label: "Help", href: "/help" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center px-4 sm:px-6 lg:px-8">
        <TaxReadyLogo href="/" />

        <nav
          aria-label="Main navigation"
          className="ml-10 hidden items-center gap-1 tablet:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 tablet:flex">
          <Button
          nativeButton={false}
            variant="ghost"
            render={<Link href="/login" />}
          >
            Log in
          </Button>

          <Button
          nativeButton={false}
           render={<Link href="/register" />}>
            Get started
          </Button>
        </div>

        <div className="ml-auto tablet:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[300px] max-w-[88vw] p-0"
            >
              <SheetTitle className="sr-only">
                TaxReady navigation
              </SheetTitle>

              <div className="border-b px-5 py-4">
                <TaxReadyLogo href="/" />
              </div>

              <div className="flex flex-col p-4">
                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="my-4 border-t" />

                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    render={
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                      />
                    }
                  >
                    Log in
                  </Button>

                  <Button
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