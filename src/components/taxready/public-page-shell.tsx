import type { ReactNode } from "react";

import { SiteFooter } from "@/components/taxready/site-footer";
import { SiteHeader } from "@/components/taxready/site-header";

type PublicPageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PublicPageShell({
  eyebrow,
  title,
  description,
  children,
}: PublicPageShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border bg-white">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            {eyebrow && (
              <p className="mb-3 text-sm font-semibold text-primary">
                {eyebrow}
              </p>
            )}

            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
              {title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {description}
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}