import type { ReactNode } from "react";

import { SiteFooter } from "@/components/homepage/site-footer";
import { SiteHeader } from "@/components/homepage/site-header";

type PublicPageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function PublicPageShell({
  title,
  description,
  children,
}: PublicPageShellProps) {
  return (
    <div className="min-h-dvh bg-white">
      <SiteHeader variant="light" />

      <main>
        {/* PAGE INTRO */}
        <section className="border-b border-slate-200 bg-[#f7f9fb] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto w-full max-w-[900px]">
            <h1 className="max-w-[760px] text-[36px] font-semibold leading-[1.08] tracking-[-0.045em] text-foreground sm:text-[44px] lg:text-[50px]">
              {title}
            </h1>

            <p className="mt-5 max-w-[700px] text-base leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
        </section>

        {/* PAGE CONTENT */}
        <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto w-full max-w-[900px]">
            {children}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export function PublicContentSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 py-8 first:pt-0 last:border-0 last:pb-0">
      <h2 className="text-xl font-semibold tracking-[-0.025em] text-foreground sm:text-2xl">
        {title}
      </h2>

      <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}