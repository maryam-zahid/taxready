import type { Metadata } from "next";
import {
  FileLock2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

import { PublicPageShell } from "@/components/taxready/public-page-shell";

export const metadata: Metadata = {
  title: "Security",
};

const items = [
  {
    title: "Authenticated access",
    description:
      "Tax practice and client portal workflows require authenticated access.",
    icon: KeyRound,
  },
  {
    title: "Controlled document access",
    description:
      "Client documents are served through authenticated application routes with ownership and access checks.",
    icon: FileLock2,
  },
  {
    title: "Activity visibility",
    description:
      "Core workflow actions can be recorded through TaxReady's audit logging capabilities.",
    icon: ShieldCheck,
  },
];

export default function SecurityPage() {
  return (
    <PublicPageShell
      eyebrow="Security"
      title="Designed around controlled access to sensitive tax preparation information."
      description="TaxReady keeps client workflows inside authenticated workspaces and applies access checks to protected document handling."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="taxready-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>

              <h2 className="mt-5 text-lg font-semibold">
                {item.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </PublicPageShell>
  );
}