import type { Metadata } from "next";

import { PublicPageShell } from "@/components/taxready/public-page-shell";

export const metadata: Metadata = {
  title: "Services",
};

const services = [
  {
    number: "01",
    title: "Collect",
    description:
      "Send structured information and document requests to clients through a secure portal.",
  },
  {
    number: "02",
    title: "Review",
    description:
      "Review submissions, document status, extracted information, and validation results.",
  },
  {
    number: "03",
    title: "Resolve",
    description:
      "Identify missing information or exceptions and keep correction work visible.",
  },
  {
    number: "04",
    title: "Prepare",
    description:
      "Track readiness and generate a preparation checklist before moving to return filing.",
  },
];

export default function ServicesPage() {
  return (
    <PublicPageShell
      eyebrow="How TaxReady helps"
      title="A structured workflow before tax return preparation begins."
      description="TaxReady focuses on the work that happens before filing: collecting information, reviewing documents, resolving gaps, and establishing preparation readiness."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {services.map((service) => (
          <article
            key={service.number}
            className="taxready-card p-6 sm:p-7"
          >
            <p className="text-sm font-semibold text-primary">
              {service.number}
            </p>

            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              {service.title}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              {service.description}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-primary/15 bg-primary/5 p-6">
        <p className="text-sm leading-6 text-muted-foreground">
          TaxReady is designed as a preparation-readiness
          workspace. It does not replace the official tax
          filing process or FBR IRIS.
        </p>
      </div>
    </PublicPageShell>
  );
}