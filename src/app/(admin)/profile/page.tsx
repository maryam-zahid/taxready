import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import { PageHeader } from "@/components/taxready/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrganizationForUser } from "@/services/organization.service";

import { EditProfileForm } from "./edit-profile-form";

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
    .toUpperCase()
    .trim() || "TR";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatPracticeType(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default async function ProfilePage() {
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

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
      createdAt: true,
      adminProfile: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          jobTitle: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const firstName =
    user.adminProfile?.firstName?.trim() ||
    user.name.split(" ")[0] ||
    "Tax";

  const lastName =
    user.adminProfile?.lastName?.trim() ||
    user.name.split(" ").slice(1).join(" ");

  const fullName =
    [firstName, lastName].filter(Boolean).join(" ");

  const jobTitle =
    user.adminProfile?.jobTitle?.trim() ||
    "Tax Professional";

  const location = [
    organization.city,
    organization.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          title="Profile"
          description="Manage your personal account information and professional details."
        />

        {/* Account overview */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b bg-muted/20 px-5 py-6 sm:px-6 sm:py-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar className="size-16 border bg-background sm:size-[72px]">
                  <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                    {getInitials(firstName, lastName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                      {fullName}
                    </h2>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {jobTitle}
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>

                <div className="border-t pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                  <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
                    Member since
                  </p>

                  <p className="mt-1.5 whitespace-nowrap text-sm font-medium">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <EditProfileForm
          initialValues={{
            firstName,
            lastName,
            phone: user.adminProfile?.phone ?? "",
            jobTitle:
              user.adminProfile?.jobTitle ?? "",
          }}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Practice */}
          <Card>
            <CardHeader className="border-b px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="size-[18px] text-primary" />
                </span>

                <div>
                 <CardTitle className="text-base">
  Tax practice
</CardTitle>

<p className="mt-0.5 text-sm text-muted-foreground">
  The practice workspace your account belongs to.
</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-5 py-6 sm:px-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Detail
                  label="Practice name"
                  value={organization.name}
                />

                <Detail
                  label="Practice type"
                  value={formatPracticeType(
                    organization.practiceType,
                  )}
                />

                <Detail
                  label="Location"
                  value={location || "Not provided"}
                />
              </div>

              <p className="mt-6 border-t pt-4 text-xs leading-5 text-muted-foreground">
  Practice information is separate from your personal
  profile and can be managed from Settings.
</p>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader className="border-b px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="size-[18px] text-primary" />
                </span>

                <div>
                  <CardTitle className="text-base">
                    Account & security
                  </CardTitle>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Sign-in and account access information.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-5 py-6 sm:px-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium">
                      Account status
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Your TaxReady account is active.
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="size-4" />
                    Active
                  </span>
                </div>

                <div className="flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-medium">
                      Sign-in email
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Used to access your TaxReady account.
                    </p>
                  </div>

                  <p className="break-all text-sm font-medium">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Authentication
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Your account is protected by authenticated
                    access. Sign out when using a shared
                    device.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-medium">
        {value}
      </p>
    </div>
  );
}