import Link from "next/link";

import {
  PublicContentSection,
  PublicPageShell,
} from "@/components/homepage/public-page-shell";

export default function HelpPage() {
  return (
    <PublicPageShell
      title="Help Center"
      description="A quick guide to the main TaxReady workflows for tax practices and their clients."
    >
      <PublicContentSection title="Getting started">
        <p>
          Create your TaxReady practice account, complete your
          practice settings, and add the clients whose preparation
          work you want to organize.
        </p>

        <p>
          Each client can have structured preparation requirements,
          requests, supporting documents, review activity, and
          readiness progress.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Client requests">
        <p>
          Create requests when you need information or supporting
          documents from a client. Requests help keep outstanding
          preparation items visible instead of relying on scattered
          email conversations.
        </p>

        <p>
          Clients can respond through their portal and submit the
          requested information or documents for your review.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Document review">
        <p>
          Submitted documents remain connected to the client
          workflow. Your practice can review submissions, use
          available extraction and validation checks, and approve,
          reject, or request corrections where required.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Preparation readiness">
        <p>
          The readiness view brings together preparation
          requirements, requests, document review, outstanding
          issues, and supported reconciliation checks so your team
          can see what still needs attention.
        </p>

        <p>
          When the required work is complete, TaxReady can provide
          a preparation checklist or package to support the next
          stage of your tax preparation process.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Client portal">
        <p>
          Clients use their own authenticated portal to view
          requests, provide requested information, upload supporting
          documents, and follow the status of their submissions.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Tax filing">
        <p>
          TaxReady is a pre-filing preparation-readiness workspace.
          It does not replace FBR IRIS or the applicable official
          tax filing process.
        </p>
      </PublicContentSection>

      <div className="mt-10 rounded-2xl border border-primary/15 bg-primary/[0.05] p-5 sm:p-6">
        <p className="font-semibold text-foreground">
          Ready to start?
        </p>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Create your practice account or sign in to continue your
          TaxReady workflow.
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
          <Link
            href="/register"
            className="text-primary hover:underline"
          >
            Get started
          </Link>

          <Link
            href="/login"
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </PublicPageShell>
  );
}