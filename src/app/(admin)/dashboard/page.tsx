import {
  Building2,
  CalendarCheck2,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  FileText,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/taxready/page-header";
import { StatusBadge } from "@/components/taxready/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { getAdminProfile } from "@/services/auth-profile.service";
import { getOrganizationForUser } from "@/services/organization.service";

const practiceTypeLabels = {
  INDEPENDENT_TAX_PROFESSIONAL:
    "Independent Tax Professional",
  TAX_ACCOUNTING_FIRM: "Tax / Accounting Firm",
  OTHER: "Other",
} as const;

export default async function DashboardPage() {
  /*
   * The shared admin layout already protects this route.
   * We still fetch the current user's data here because the
   * dashboard needs it as page-specific content.
   */
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profile, organization] = await Promise.all([
    getAdminProfile(session.user.id),
    getOrganizationForUser(session.user.id),
  ]);

  if (!profile) {
    redirect("/onboarding/profile");
  }

  if (!organization) {
    redirect("/onboarding/firm");
  }

  return (
    <div className="app-page">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${profile.firstName}. Here's an overview of your tax practice.`}
        actions={
<Button
  nativeButton={false}
  render={<a href="/clients/new" />}
>
              <Plus className="size-4" />
            Add client
          </Button>
        }
      />

      <section
        aria-label="Practice overview"
        className="mt-6 grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 tablet:gap-4 desktop:grid-cols-4"
      >
        <OverviewCard
          title="Clients"
          value="—"
          description="Total clients"
          icon={Users}
        />

        <OverviewCard
          title="Open requests"
          value="—"
          description="Awaiting action"
          icon={ClipboardList}
        />

        <OverviewCard
          title="Documents"
          value="—"
          description="Submitted this year"
          icon={FileText}
        />

        <OverviewCard
          title="Exceptions"
          value="—"
          description="Require attention"
          icon={CircleAlert}
          attention
        />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 desktop:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <Card className="shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">
                  Tax readiness
                </CardTitle>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Monitor client preparation and filing
                  readiness.
                </p>
              </div>

              <StatusBadge tone="info">
                Overview
              </StatusBadge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <EmptyDashboardState />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b">
            <CardTitle className="text-base">
              Practice
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <PracticeDetail
              icon={Building2}
              label="Practice name"
              value={organization.name}
            />

            <Separator />

            <PracticeDetail
              icon={Users}
              label="Practice type"
              value={
                practiceTypeLabels[
                  organization.practiceType
                ]
              }
            />

            <Separator />

            <PracticeDetail
              icon={MapPin}
              label="Location"
              value={
                organization.city
                  ? `${organization.city}, ${organization.country}`
                  : organization.country
              }
            />
          </CardContent>
        </Card>
      </div>

      <section className="mt-6">
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-[-0.01em]">
            Attention needed
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Items that may need action from your practice.
          </p>
        </div>

        <Card className="shadow-none">
          <CardContent className="flex min-h-32 items-center justify-center p-6">
            <div className="flex max-w-md flex-col items-center text-center">
              <div className="flex size-9 items-center justify-center rounded-lg bg-success-muted text-success">
                <CheckCircle2 className="size-[18px]" />
              </div>

              <p className="mt-3 text-sm font-medium">
                Nothing needs your attention
              </p>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Exceptions, overdue requests and review
                items will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

type OverviewCardProps = {
  title: string;
  value: string;
  description: string;
  icon: typeof Users;
  attention?: boolean;
};

function OverviewCard({
  title,
  value,
  description,
  icon: Icon,
  attention = false,
}: OverviewCardProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-4 tablet:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <p className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.03em]">
              {value}
            </p>

            <p className="mt-2 truncate text-xs text-muted-foreground">
              {description}
            </p>
          </div>

          <div
            className={
              attention
                ? "flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning-muted text-warning"
                : "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary"
            }
          >
            <Icon
              className="size-[18px]"
              strokeWidth={1.9}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyDashboardState() {
  return (
    <div className="flex min-h-[280px] items-center justify-center px-5 py-10 tablet:min-h-[320px]">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <CalendarCheck2
            className="size-5"
            strokeWidth={1.9}
          />
        </div>

        <h3 className="mt-4 text-sm font-semibold">
          Readiness overview is coming together
        </h3>

        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
          As clients complete requirements, their readiness
          progress and review status will appear here.
        </p>
      </div>
    </div>
  );
}

type PracticeDetailProps = {
  icon: typeof Building2;
  label: string;
  value: string;
};

function PracticeDetail({
  icon: Icon,
  label,
  value,
}: PracticeDetailProps) {
  return (
    <div className="flex gap-3 px-5 py-4">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon
          className="size-4"
          strokeWidth={1.9}
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}