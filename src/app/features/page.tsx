import type { Metadata } from "next";
import {
  BellRing,
  CircleAlert,
  ClipboardCheck,
  FileCheck2,
  FileUp,
  ListChecks,
} from "lucide-react";

import { PublicPageShell } from "@/components/taxready/public-page-shell";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore TaxReady features for client requests, document collection, review, validation, exceptions, and tax preparation readiness.",
};

const features = [
  {
    title: "Client onboarding",
    description:
      "Organize individual and business client information in one structured workspace.",
    icon: ClipboardCheck,
  },
  {
    title: "Document collection",
    description:
      "Request required information and securely collect client documents through the client portal.",
    icon: FileUp,
  },
  {
    title: "Compliance checklists",
    description:
      "Track required information and documents against a clear preparation checklist.",
    icon: ListChecks,
  },
  {
    title: "Automated reminders",
    description:
      "Keep outstanding client requests moving with scheduled email reminders.",
    icon: BellRing,
  },
  {
    title: "Review and validation",
    description:
      "Review submitted documents, extract basic information, and identify validation issues before preparation.",
    icon: FileCheck2,
  },
  {
    title: "Exception tracking",
    description:
      "Assign, review, and resolve preparation exceptions without losing their context.",
    icon: CircleAlert,
  },
];

export default function FeaturesPage() {
  return (
    <PublicPageShell
      eyebrow="Product features"
      title="Everything needed to get client tax information preparation-ready."
      description="TaxReady brings requests, documents, reviews, reminders, exceptions, and readiness tracking into one organized workflow."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className="taxready-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon
                  className="size-5"
                  strokeWidth={1.8}
                />
              </span>

              <h2 className="mt-5 text-lg font-semibold tracking-tight">
                {feature.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>
    </PublicPageShell>
  );
}