import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  BellRing,
  Building2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import { PageHeader } from "@/components/taxready/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getOrganizationForUser } from "@/services/organization.service";

import { PracticeSettingsForm } from "./practice-settings-form";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const organization = await getOrganizationForUser(
    session.user.id,
  );

  if (!organization) {
    redirect("/onboarding/firm");
  }

  const smtpConfigured = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD,
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your tax practice, client communication, and workspace configuration."
        />

        <Card>
          <CardHeader className="border-b px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="size-[18px] text-primary" />
              </span>

              <div>
                <CardTitle className="text-base">
                  Practice information
                </CardTitle>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  Business details associated with your
                  TaxReady workspace.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-5 py-6 sm:px-6">
          
           <PracticeSettingsForm
  initialValues={{
    name: organization.name,
    practiceType: organization.practiceType,
    businessEmail:
      organization.businessEmail ?? "",
    businessPhone:
      organization.businessPhone ?? "",
    ntn: organization.ntn ?? "",
    website: organization.website ?? "",
    country: organization.country,
    city: organization.city ?? "",
    address: organization.address ?? "",
  }}
/>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="border-b px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <BellRing className="size-[18px] text-primary" />
                </span>

                <div>
                  <CardTitle className="text-base">
                    Email & reminders
                  </CardTitle>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Client reminder delivery configuration.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-5 py-6 sm:px-6">
              <SettingRow
                title="Email delivery"
                description="SMTP email delivery for client reminders."
                value={
                  smtpConfigured
                    ? "Configured"
                    : "Not configured"
                }
                positive={smtpConfigured}
              />

              <SettingRow
                title="Automated reminders"
                description="Pending, due-soon and overdue request reminders."
                value="Enabled"
                positive
                last
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <ExternalLink className="size-[18px] text-primary" />
                </span>

                <div>
                  <CardTitle className="text-base">
                    Client portal
                  </CardTitle>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Secure client request and document workspace.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-5 py-6 sm:px-6">
              <SettingRow
                title="Client portal"
                description="Clients can access requests and submit information securely."
                value="Active"
                positive
              />

              <SettingRow
                title="Document uploads"
                description="Secure private client document submission."
                value="Enabled"
                positive
                last
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="size-[18px] text-primary" />
              </span>

              <div>
                <CardTitle className="text-base">
                  Workspace & security
                </CardTitle>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  Account and workspace protection.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6 px-5 py-6 sm:grid-cols-2 sm:px-6">
            <div>
              <p className="text-sm font-medium">
                Authenticated admin access
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                TaxReady administration pages require an
                authenticated practice account.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">
                Secure client documents
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Client document access is protected through
                authenticated and organization-scoped routes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  value,
  positive = false,
  last = false,
}: {
  title: string;
  description: string;
  value: string;
  positive?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-4 py-4 first:pt-0",
        last ? "pb-0" : "border-b",
      ].join(" ")}
    >
      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>

      <span
  className={[
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
    positive
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-border bg-muted/30 text-muted-foreground",
  ].join(" ")}
>
  {positive && (
    <span className="size-1.5 rounded-full bg-emerald-500" />
  )}

  {value}
</span>
    </div>
  );
}