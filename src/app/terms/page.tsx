import {
  PublicContentSection,
  PublicPageShell,
} from "@/components/homepage/public-page-shell";

export default function TermsPage() {
  return (
    <PublicPageShell
      title="Terms"
      description="General terms for using the current TaxReady application."
    >
      <PublicContentSection title="Purpose of TaxReady">
        <p>
          TaxReady is designed to help tax consultants and practices
          organize client information, preparation requests,
          documents, review work, preparation checks, and readiness
          before filing.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Not a filing platform">
        <p>
          TaxReady supports pre-filing preparation and readiness. It
          does not replace FBR IRIS or another applicable official
          filing system, and it does not itself represent completion
          of an official tax filing.
        </p>
      </PublicContentSection>

      <PublicContentSection title="User responsibilities">
        <p>
          Users are responsible for the information and documents
          they provide, the clients they manage, and the professional
          review of information used in tax preparation.
        </p>

        <p>
          Automated extraction, validation, reminders, readiness
          indicators, and other workflow assistance should be used
          as preparation support rather than as a substitute for
          appropriate professional review.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Account access">
        <p>
          Users are responsible for using their accounts
          appropriately and for maintaining the confidentiality of
          their authentication credentials.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Application availability">
        <p>
          TaxReady is currently an MVP. Features, workflows, and
          application behavior may change as the product is
          developed and evaluated.
        </p>
      </PublicContentSection>

      <PublicContentSection title="Important notice">
        <p>
          These terms are suitable as informational MVP content and
          are not a substitute for production legal terms reviewed
          for the jurisdictions in which TaxReady may ultimately be
          offered.
        </p>
      </PublicContentSection>
    </PublicPageShell>
  );
}