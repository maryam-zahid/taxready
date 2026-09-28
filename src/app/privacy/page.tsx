import {
  PublicContentSection,
  PublicPageShell,
} from "@/components/homepage/public-page-shell";

export default function PrivacyPage() {
  return (
    <PublicPageShell
      title="Privacy"
      description="An overview of how information is handled within the TaxReady application."
    >
      <PublicContentSection title="Information used by TaxReady">
        <p>
          TaxReady may process account, practice, client,
          preparation, request, and document information that users
          provide while using the application.
        </p>
      </PublicContentSection>

      <PublicContentSection title="How information is used">
        <p>
          Information is used to provide TaxReady workflows,
          including practice administration, client preparation
          records, requests, document submission and review,
          reminders, readiness tracking, and related application
          functionality.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Account access">
        <p>
          Practice and client workflows are protected by
          authenticated access. Application authorization and
          ownership checks are used where applicable to control
          access to client information and documents.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Client documents">
        <p>
          Documents submitted through TaxReady are used as part of
          the relevant client preparation workflow. Access to those
          documents is provided through protected application
          workflows rather than being intentionally exposed as
          public preparation records.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Operational records">
        <p>
          TaxReady may maintain application records required to
          support workflow status, notifications, reminders, review
          activity, and audit visibility.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Important notice">
        <p>
          This page describes the current TaxReady MVP at a general
          product level and is not intended to substitute for a
          jurisdiction-specific privacy policy prepared for a
          production deployment.
        </p>
      </PublicContentSection>
    </PublicPageShell>
  );
}