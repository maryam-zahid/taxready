import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { StatusBadge } from "@/components/taxready/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getClientForUser } from "@/services/client.service";
import { getClientRequirementsForUser } from "@/services/compliance-requirement.service";
import { getClientRequestsForUser } from "@/services/client-request.service";
import { getClientPortalAccessForUser } from "@/services/client-invitation.service";
import { getOrganizationForUser } from "@/services/organization.service";
import { calculateClientReadiness } from "@/services/readiness.service";

import { ClientRequests } from "./client-requests";
import { ComplianceChecklist } from "./compliance-checklist";
import { GenerateComplianceButton } from "./generate-compliance-button";
import { MarkTaxReadyButton } from "./mark-tax-ready-button";
import { PortalAccess } from "./portal-access";

type ClientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    requestRequirement?: string | string[];
  }>;
};

const taxpayerTypeLabels: Record<string, string> = {
  SALARIED_INDIVIDUAL: "Salaried individual",
  FREELANCER_PROFESSIONAL: "Freelancer / Professional",
  SOLE_PROPRIETOR: "Sole proprietor",
  OTHER_INDIVIDUAL: "Other individual",
};

const entityTypeLabels: Record<string, string> = {
  PARTNERSHIP_AOP: "Partnership / AOP",
  PRIVATE_LIMITED_COMPANY: "Private limited company",
  PUBLIC_LIMITED_COMPANY: "Public limited company",
  OTHER: "Other",
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function getClientStatusTone(
  status: string,
):
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger" {
  return status === "ACTIVE"
    ? "success"
    : status === "INACTIVE"
      ? "neutral"
      : "info";
}

function getReadinessTone(
  status: string,
):
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger" {
  switch (status) {
    case "TAX_READY":
      return "success";
    case "READY_FOR_REVIEW":
      return "info";
    case "BLOCKED":
      return "danger";
    default:
      return "warning";
  }
}

export default async function ClientDetailPage({
  params,
  searchParams,
}: ClientDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const query = await searchParams;

  const requestedRequirementId =
    typeof query.requestRequirement === "string"
      ? query.requestRequirement
      : null;

  const client = await getClientForUser(
    session.user.id,
    id,
  );

  if (!client) {
    notFound();
  }

  const organization = await getOrganizationForUser(
    session.user.id,
  );

  if (!organization) {
    redirect("/onboarding/firm");
  }

  const [
    requirements,
    requests,
    portalData,
    readiness,
  ] = await Promise.all([
    getClientRequirementsForUser(
      session.user.id,
      id,
    ),
    getClientRequestsForUser(
      session.user.id,
      id,
    ),
    getClientPortalAccessForUser(
      session.user.id,
      id,
    ),
    calculateClientReadiness({
      organizationId: organization.id,
      clientId: id,
    }),
  ]);

  const clientName =
    client.type === "INDIVIDUAL"
      ? `${client.firstName ?? ""} ${
          client.lastName ?? ""
        }`.trim() || "Unnamed client"
      : client.businessName ?? "Unnamed business";

  const isIndividual =
    client.type === "INDIVIDUAL";

  const clientTypeLabel = isIndividual
    ? "Individual"
    : "Business";

  const portalStatus =
    portalData.portalAccess?.status ??
    "NOT_INVITED";

  const requestRequirementOptions =
    requirements.map((requirement) => ({
      id: requirement.id,
      status: requirement.status,
      title:
        requirement.requirementDefinition.title,
    }));

   const requestItems = requests.map(
    (request) => ({
      id: request.id,
      clientRequirementId:
        request.clientRequirementId,
      status: request.status,
      subject: request.subject,
      message: request.message,
      dueAt: request.dueAt,
      sentAt: request.sentAt,
      requirementTitle:
        request.clientRequirement
          .requirementDefinition.title,
      hasInformationResponse:
        request.responses.length > 0,
      documentId:
        request.documents[0]?.id ?? null,
    }),
  );
  const checklistNavigation = requestItems.map(
  (request) => ({
    requirementId: request.clientRequirementId,
    requestId: request.id,
    documentId: request.documentId,
  }),
);

  const taxpayerOrEntityValue = isIndividual
    ? client.taxpayerType
      ? taxpayerTypeLabels[client.taxpayerType] ??
        formatLabel(client.taxpayerType)
      : "Not provided"
    : client.entityType
      ? entityTypeLabels[client.entityType] ??
        formatLabel(client.entityType)
      : "Not provided";

  const occupationOrActivity = isIndividual
    ? client.occupation || "Not provided"
    : client.businessActivity || "Not provided";

  const deadline = client.preparationDeadline
    ? new Intl.DateTimeFormat("en-PK", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(client.preparationDeadline)
    : "Not set";

  const outstandingRequests = requests.filter(
    (request) =>
      request.status === "SENT" ||
      request.status === "VIEWED",
  ).length;

  const submittedRequests = requests.filter(
    (request) =>
      request.status === "SUBMITTED",
  ).length;

  const completedRequests = requests.filter(
    (request) =>
      request.status === "COMPLETED",
  ).length;

  const incompleteRequired = Math.max(
    readiness.totalRequired -
      readiness.completedRequired,
    0,
  );

  const reviewedRequests =
    submittedRequests + completedRequests;

  const attentionCount =
    incompleteRequired +
    readiness.blockingExceptionCount;

  return (
    <div className="w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-7">
      {/* Back */}
      <Button
        nativeButton={false}
        variant="ghost"
        size="sm"
        render={<Link href="/clients" />}
        className="-ml-2 mb-3"
      >
        <ArrowLeft className="size-4" />
        Back to clients
      </Button>

      {/* Client header */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                tone={getClientStatusTone(
                  client.status,
                )}
              >
                {formatLabel(client.status)}
              </StatusBadge>

              <StatusBadge>
                {clientTypeLabel}
              </StatusBadge>

              <StatusBadge
                tone={
                  portalStatus === "ACTIVE"
                    ? "info"
                    : portalStatus === "INVITED"
                      ? "warning"
                      : "neutral"
                }
              >
                Portal {formatLabel(portalStatus)}
              </StatusBadge>
            </div>

            <h1 className="mt-3 break-words text-2xl font-semibold tracking-[-0.035em] text-foreground sm:text-3xl">
              {clientName}
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              {clientTypeLabel} client · Tax year{" "}
              {client.taxYear}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              nativeButton={false}
              variant="outline"
              render={
                <Link
                  href={`/clients/${client.id}/preparation-package`}
                  target="_blank"
                />
              }
              className="w-full sm:w-auto"
            >
              <FileText className="size-4" />
              Preparation package
            </Button>

            <Button
              nativeButton={false}
              render={
                <Link
                  href={`/clients/${client.id}/tax-profile`}
                />
              }
              className="w-full sm:w-auto"
            >
              <UserRound className="size-4" />
              Tax profile
            </Button>
          </div>
        </div>
      </section>

      {/* Readiness */}
      <section className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              Preparation readiness
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {clientName} · FY {client.taxYear}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              tone={getReadinessTone(
                readiness.status,
              )}
            >
              {formatLabel(readiness.status)}
            </StatusBadge>

            {readiness.status ===
            "READY_FOR_REVIEW" ? (
              <MarkTaxReadyButton
                clientId={client.id}
              />
            ) : null}
          </div>
        </div>

        <div className="grid gap-7 px-5 py-6 sm:px-6 lg:grid-cols-[210px_minmax(0,1fr)] lg:items-center lg:gap-10">
          <ReadinessRing
            percentage={readiness.percentage}
            status={readiness.status}
          />

          <div className="min-w-0">
            <div>
              <p className="text-base font-semibold text-foreground">
                Client file progress
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Readiness reflects collection, review and
                preparation checks.
              </p>
            </div>

            <div className="mt-4 divide-y">
              <ReadinessLine
                label="Checklist"
                value={`${readiness.completedRequired} / ${readiness.totalRequired}`}
                complete={incompleteRequired === 0}
              />

              <ReadinessLine
                label="Requests reviewed"
                value={`${completedRequests} / ${requests.length}`}
                complete={
                  requests.length > 0 &&
                  completedRequests === requests.length
                }
              />

              <ReadinessLine
                label="Open requests"
                value={String(outstandingRequests)}
                attention={outstandingRequests > 0}
              />

              <ReadinessLine
                label="Unresolved issues"
                value={String(
                  readiness.blockingExceptionCount,
                )}
                attention={
                  readiness.blockingExceptionCount > 0
                }
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-6 sm:px-6">
          <ReadinessMessage
            status={readiness.status}
            blockingExceptions={
              readiness.blockingExceptionCount
            }
            attentionCount={attentionCount}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ReadinessSummary
              title="Document review"
              description={`${completedRequests} of ${requests.length} reviewed`}
              complete={
                requests.length > 0 &&
                completedRequests === requests.length
              }
            />

            <ReadinessSummary
              title="Preparation checklist"
              description={`${readiness.completedRequired} of ${readiness.totalRequired} completed`}
              complete={incompleteRequired === 0}
            />

            <ReadinessSummary
              title="Submitted"
              description={
                submittedRequests > 0
                  ? `${submittedRequests} awaiting review`
                  : "Nothing awaiting review"
              }
              complete={submittedRequests === 0}
              attention={submittedRequests > 0}
            />

            <ReadinessSummary
              title="Open issues"
              description={
                readiness.blockingExceptionCount > 0
                  ? `${readiness.blockingExceptionCount} unresolved`
                  : "No blocking issues"
              }
              complete={
                readiness.blockingExceptionCount === 0
              }
              attention={
                readiness.blockingExceptionCount > 0
              }
            />
          </div>
        </div>
      </section>

      {/* Compact client details */}
      <section className="mt-4">
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="border-b px-5 py-4 sm:px-6">
            <div>
              <CardTitle className="text-base">
                Client details
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Identity, contact and preparation
                information.
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid divide-y tablet:grid-cols-2 tablet:divide-x tablet:divide-y-0">
              <div>
                <DetailSectionHeader>
                  Client information
                </DetailSectionHeader>

                <div className="divide-y">
                  <DetailRow
                    icon={Mail}
                    label="Email"
                    value={client.email}
                  />

                  <DetailRow
                    icon={Phone}
                    label="Phone"
                    value={
                      client.phone ||
                      "Not provided"
                    }
                  />

                  <DetailRow
                    icon={UserRound}
                    label={
                      isIndividual
                        ? "Taxpayer type"
                        : "Entity type"
                    }
                    value={taxpayerOrEntityValue}
                  />

                  <DetailRow
                    icon={FileText}
                    label={
                      isIndividual
                        ? "Profession / occupation"
                        : "Business activity"
                    }
                    value={occupationOrActivity}
                  />

                  {!isIndividual ? (
                    <DetailRow
                      icon={UserRound}
                      label="Contact person"
                      value={
                        client.contactPerson ||
                        "Not provided"
                      }
                    />
                  ) : null}
                </div>
              </div>

              <div>
                <DetailSectionHeader>
                  Preparation
                </DetailSectionHeader>

                <div className="divide-y">
                  <DetailRow
                    icon={CalendarDays}
                    label="Tax year"
                    value={String(client.taxYear)}
                  />

                  <DetailRow
                    icon={FileText}
                    label="NTN / registration"
                    value={
                      client.ntn ||
                      "Not provided"
                    }
                  />

                  <DetailRow
                    icon={CalendarDays}
                    label="Internal deadline"
                    value={deadline}
                  />

                  <DetailRow
                    icon={UserRound}
                    label="Client portal"
                    value={formatLabel(
                      portalStatus,
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Checklist */}
      <section className="mt-4">
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="border-b px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="text-base">
                  Preparation checklist
                </CardTitle>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Requirements generated from this
                  client&apos;s saved tax profile.
                </p>
              </div>

              <GenerateComplianceButton
                clientId={client.id}
                hasRequirements={
                  requirements.length > 0
                }
                hasTaxProfile={Boolean(
                  client.taxProfile,
                )}
              />
            </div>
          </CardHeader>

         <ComplianceChecklist
  clientId={id}
  requirements={requirements}
  navigation={checklistNavigation}
/>
        </Card>
      </section>

      {/* Existing workflows unchanged */}
      <PortalAccess
        clientId={id}
        email={portalData.email}
        portalAccess={
          portalData.portalAccess
            ? {
                status:
                  portalData.portalAccess
                    .status,
                invitedAt:
                  portalData.portalAccess
                    .invitedAt,
                activatedAt:
                  portalData.portalAccess
                    .activatedAt,
                disabledAt:
                  portalData.portalAccess
                    .disabledAt,
              }
            : null
        }
        latestInvitation={
          portalData.latestInvitation
            ? {
                id:
                  portalData.latestInvitation
                    .id,
                status:
                  portalData.latestInvitation
                    .status,
                email:
                  portalData.latestInvitation
                    .email,
                sentAt:
                  portalData.latestInvitation
                    .sentAt,
                expiresAt:
                  portalData.latestInvitation
                    .expiresAt,
              }
            : null
        }
      />

      <ClientRequests
        key={
          requestedRequirementId ??
          "default"
        }
        clientId={id}
        requirements={
          requestRequirementOptions
        }
        requests={requestItems}
        requestedRequirementId={
          requestedRequirementId
        }
      />
    </div>
  );
}

function ReadinessRing({
  percentage,
  status,
}: {
  percentage: number;
  status: string;
}) {
  const normalized = Math.max(
    0,
    Math.min(100, percentage),
  );

  const ringColor =
    status === "TAX_READY"
      ? "#059669"
      : status === "BLOCKED"
        ? "#dc2626"
        : status === "IN_PROGRESS"
          ? "#f59e0b"
          : "#2563eb";

  return (
    <div className="flex justify-center">
      <div
        className="relative flex size-[170px] items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${ringColor} ${normalized * 3.6}deg, #eef2f7 0deg)`,
        }}
        role="progressbar"
        aria-label="Preparation readiness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalized}
      >
        <div className="absolute inset-[12px] rounded-full bg-white" />

        <div className="relative z-10 text-center">
          <p className="text-4xl font-semibold tracking-[-0.05em] tabular-nums text-foreground">
            {normalized}%
          </p>

          <p className="mt-1 text-xs font-medium text-muted-foreground">
            preparation ready
          </p>
        </div>
      </div>
    </div>
  );
}

function ReadinessLine({
  label,
  value,
  complete = false,
  attention = false,
}: {
  label: string;
  value: string;
  complete?: boolean;
  attention?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className={[
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          attention
            ? "bg-amber-500/10 text-amber-700"
            : complete
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-primary/10 text-primary",
        ].join(" ")}
      >
        {attention ? (
          <CircleAlert className="size-3.5" />
        ) : complete ? (
          <Check className="size-3.5" />
        ) : (
          <ClipboardCheck className="size-3.5" />
        )}
      </span>

      <p className="min-w-0 flex-1 text-sm text-muted-foreground">
        {label}
      </p>

      <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function ReadinessSummary({
  title,
  description,
  complete = false,
  attention = false,
}: {
  title: string;
  description: string;
  complete?: boolean;
  attention?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-slate-50/50 p-4">
      <div className="flex items-start gap-3">
        <span
          className={[
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
            attention
              ? "bg-amber-500/10 text-amber-700"
              : complete
                ? "bg-emerald-500/10 text-emerald-700"
                : "bg-primary/10 text-primary",
          ].join(" ")}
        >
          {attention ? (
            <CircleAlert className="size-4" />
          ) : complete ? (
            <Check className="size-4" />
          ) : (
            <ClipboardList className="size-4" />
          )}
        </span>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReadinessMessage({
  status,
  blockingExceptions,
  attentionCount,
}: {
  status: string;
  blockingExceptions: number;
  attentionCount: number;
}) {
  if (status === "TAX_READY") {
    return (
      <div className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />

        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Preparation complete
          </p>

          <p className="mt-1 text-sm leading-6 text-emerald-800/80">
            This client has been marked tax-ready.
          </p>
        </div>
      </div>
    );
  }

  if (status === "BLOCKED") {
    return (
      <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-red-600" />

        <div>
          <p className="text-sm font-semibold text-red-700">
            Preparation is blocked
          </p>

          <p className="mt-1 text-sm leading-6 text-red-700/80">
            Resolve {blockingExceptions} blocking{" "}
            {blockingExceptions === 1
              ? "issue"
              : "issues"}{" "}
            before this client can become tax-ready.
          </p>
        </div>
      </div>
    );
  }

  if (status === "READY_FOR_REVIEW") {
    return (
      <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-4">
        <FileCheck2 className="mt-0.5 size-5 shrink-0 text-blue-600" />

        <div>
          <p className="text-sm font-semibold text-blue-700">
            Ready for final review
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-700/80">
            Required preparation items are complete.
            Complete the final review before marking the
            client tax-ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
      <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />

      <div>
        <p className="text-sm font-semibold text-amber-800">
          {attentionCount > 0
            ? `${attentionCount} ${
                attentionCount === 1
                  ? "item requires"
                  : "items require"
              } attention`
            : "Preparation in progress"}
        </p>

        <p className="mt-1 text-sm leading-6 text-amber-800/80">
          Complete the remaining information and resolve
          preparation issues before final review.
        </p>
      </div>
    </div>
  );
}

function DetailSectionHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border-b bg-muted/20 px-5 py-2.5">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-2 px-5 py-3 sm:grid-cols-[155px_minmax(0,1fr)] sm:items-center sm:gap-4">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />

        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>
      </div>

      <p className="min-w-0 break-words text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}