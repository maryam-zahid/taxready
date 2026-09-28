import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getAdminProfile } from "@/services/auth-profile.service";

import { ProfileForm } from "./profile-form";

export default async function ProfileOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const profile = await getAdminProfile(session.user.id);

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/login"
            className="inline-flex min-w-0 items-center gap-2.5"
            aria-label="TaxReady"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
              T
            </span>

            <span className="truncate text-lg font-semibold tracking-tight text-foreground">
              TaxReady
            </span>
          </Link>

          <span className="text-xs text-muted-foreground sm:text-sm">
            Account setup
          </span>
        </div>
      </header>

      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-9">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-5 sm:mb-6">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                Step 2 of 4
              </p>

              <p className="text-xs font-medium text-muted-foreground">
                Your profile
              </p>
            </div>

            <div
              role="progressbar"
              aria-label="Account setup progress"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={2}
              className="h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div className="h-full w-1/2 rounded-full bg-primary" />
            </div>
          </div>

          <section className="rounded-xl border border-border bg-background px-5 py-6 shadow-sm sm:px-8 sm:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Personal details
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
              Tell us about yourself
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Add your professional details so your TaxReady
              workspace can be personalized for you and your
              practice.
            </p>

            <ProfileForm
              email={session.user.email}
              initialValues={{
                firstName: profile?.firstName ?? "",
                lastName: profile?.lastName ?? "",
                phone: profile?.phone ?? "",
              }}
            />
          </section>
        </div>
      </main>

      <footer className="px-4 pb-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TaxReady. All rights
        reserved.
      </footer>
    </div>
  );
}