import Link from "next/link";

import { getClientInvitationByToken } from "@/services/client-invitation.service";

import { InviteActivationForm } from "./invite-activation-form";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

function TaxReadyHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/login"
          className="inline-flex min-w-0 items-center gap-2.5"
          aria-label="TaxReady home"
        >
<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">            T
          </span>

          <span className="truncate text-lg font-semibold tracking-tight text-foreground">
            TaxReady
          </span>
        </Link>

        <div className="text-right text-xs text-muted-foreground sm:text-sm">
          <span className="hidden sm:inline">Need help? </span>
          <a
            href="mailto:support@taxready.example"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Contact support
          </a>
        </div>
      </div>
    </header>
  );
}

function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <TaxReadyHeader />

<main className="flex w-full flex-1 items-center justify-center px-4 py-5 sm:px-6 sm:py-7">        {children}
      </main>

      <footer className="px-4 pb-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TaxReady. All rights reserved.
      </footer>
    </div>
  );
}

export default async function InvitePage({
  params,
}: InvitePageProps) {
  const { token } = await params;

  try {
    const invitation =
      await getClientInvitationByToken(token);

    return (
      <PageShell>
<section className="w-full max-w-[480px] rounded-xl border border-border bg-background px-5 py-6 shadow-sm sm:px-7 sm:py-7">      
<div className="border-b border-border pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
              Client portal
            </p>

<h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Activate your account
            </h1>

<p className="mt-2 text-sm leading-6 text-muted-foreground">
              Set your password to securely access your
              TaxReady client portal and manage your tax
              information.
            </p>
          </div>

<div className="mt-4 rounded-lg border border-primary/10 bg-primary/5 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              Email address
            </p>

            <p className="mt-1 break-all text-sm font-medium text-foreground">
              {invitation.email}
            </p>
          </div>

          <InviteActivationForm
            token={token}
            email={invitation.email}
            clientName={invitation.clientName}
          />
        </section>
      </PageShell>
    );
  } catch {
    return (
      <PageShell>
<section className="w-full max-w-[480px] rounded-xl border border-border bg-background px-5 py-6 shadow-sm sm:px-7 sm:py-7">          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
            Client portal
          </p>

<h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Invitation unavailable
          </h1>

<p className="mt-2 text-sm leading-6 text-muted-foreground">
            This invitation is invalid, expired, or has
            already been used. Please contact your tax
            professional for a new invitation.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Go to login
          </Link>
        </section>
      </PageShell>
    );
  }
}