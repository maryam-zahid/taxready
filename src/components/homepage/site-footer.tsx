import Link from "next/link";
import {
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { TaxReadyLogo } from "@/components/taxready/taxready-logo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr]">
          {/* BRAND */}
          <div className="max-w-[390px]">
            <TaxReadyLogo href="/" />

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A preparation-readiness workspace for tax consultants
              and practices to organize client requests, documents,
              reviews, preparation checks, and outstanding issues
              before filing.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <LockKeyhole
                className="size-4 text-primary"
                strokeWidth={1.9}
              />
              Structured client preparation workflows
            </div>
          </div>

          {/* PRODUCT */}
          <FooterGroup
            title="Product"
            links={[
              ["Features", "/#features"],
              ["Workflow", "/#workflow"],
              ["Client experience", "/#services"],
              ["Security", "/#security"],
            ]}
          />

          {/* RESOURCES */}
          <FooterGroup
            title="Resources"
            links={[
              ["Help Center", "/help"],
              ["Sign in", "/login"],
              ["Get started", "/register"],
            ]}
          />

          {/* LEGAL */}
          <FooterGroup
            title="Legal"
            links={[
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
            ]}
          />
        </div>

        {/* BOTTOM */}
        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} TaxReady. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <ShieldCheck
              className="size-3.5 text-primary"
              strokeWidth={1.9}
            />

            <span>
              Built for preparation readiness
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
        {title}
      </p>

      <div className="mt-4 flex flex-col gap-2.5">
        {links.map(([label, href]) => (
          <Link
            key={`${href}-${label}`}
            href={href}
            className="w-fit text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}