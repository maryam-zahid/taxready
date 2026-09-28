import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { TaxReadyLogo } from "@/components/taxready/taxready-logo";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Services", href: "/services" },
];

const resourceLinks = [
  { label: "Help Center", href: "/help" },
  { label: "Security", href: "/security" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-9 lg:grid-cols-[1.6fr_0.8fr_0.8fr_0.9fr] lg:gap-12">
          <div className="col-span-2 max-w-md lg:col-span-1">
            <TaxReadyLogo href="/" />

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A secure workspace that helps tax
              professionals collect client information,
              organize documents, review exceptions, and
              track tax preparation readiness.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole
                className="size-4 text-primary"
                strokeWidth={1.8}
              />
              Secure tax preparation workspace
            </div>
          </div>

          <FooterColumn
            title="Product"
            links={productLinks}
          />

          <FooterColumn
            title="Resources"
            links={resourceLinks}
          />

          <FooterColumn
            title="Legal"
            links={legalLinks}
          />
        </div>

        <div className="mt-9 border-t border-border pt-5">
          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} TaxReady. All
              rights reserved.
            </p>

            <p>
              Tax preparation readiness, organized in one
              workspace.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
        {title}
      </p>

      <nav className="mt-4 flex flex-col items-start gap-2.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}