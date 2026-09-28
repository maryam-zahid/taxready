import Link from "next/link";
import {
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { TaxReadyLogo } from "@/components/taxready/taxready-logo";

const productLinks = [
  {
    label: "Overview",
    href: "/",
  },
  {
    label: "Features",
    href: "/features",
  },
  {
    label: "Services",
    href: "/services",
  },
];

const resourceLinks = [
  {
    label: "Help Center",
    href: "/help",
  },
  {
    label: "Security",
    href: "/security",
  },
];

const legalLinks = [
  {
    label: "Privacy Policy",
    href: "/privacy",
  },
  {
    label: "Terms & Conditions",
    href: "/terms",
  },
];

export function AppFooter() {
  return (
    <footer className="relative z-20 w-full border-t border-border bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-7 lg:grid-cols-[1.55fr_0.75fr_0.85fr_0.85fr] lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 max-w-[380px] lg:col-span-1">
            <TaxReadyLogo />

            <p className="mt-3 max-w-[350px] text-[13px] leading-5 text-muted-foreground">
              A secure tax preparation readiness
              workspace for organizing client requests,
              documents, reviews, exceptions, and
              preparation progress.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck
                className="size-4 shrink-0 text-primary"
                strokeWidth={1.9}
              />

              <span>
                Built for secure tax preparation workflows
              </span>
            </div>
          </div>

          {/* Product */}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-foreground">
              Product
            </p>

            <nav
              aria-label="Product links"
              className="mt-3 flex flex-col items-start gap-2"
            >
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Resources */}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-foreground">
              Resources
            </p>

            <nav
              aria-label="Resource links"
              className="mt-3 flex flex-col items-start gap-2"
            >
              {resourceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="col-span-2 min-w-0 sm:col-span-1 lg:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-foreground">
              Legal
            </p>

            <nav
              aria-label="Legal links"
              className="mt-3 flex flex-col items-start gap-2"
            >
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 flex items-start gap-2">
              <FileCheck2
                className="mt-0.5 size-4 shrink-0 text-primary"
                strokeWidth={1.9}
              />

              <p className="text-xs leading-4 text-muted-foreground">
                Tax preparation readiness,
                organized in one workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[11px] text-muted-foreground sm:text-xs">
            <p>
              © {new Date().getFullYear()} TaxReady.
              All rights reserved.
            </p>

            <div className="flex items-center gap-1.5">
              <LockKeyhole
                className="size-3.5 shrink-0 text-primary"
                strokeWidth={1.8}
              />

              <span>
                Secure tax preparation workspace
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}