import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
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

function getReadinessBarClass(status: string) {
  switch (status) {
    case "TAX_READY":
      return "bg-emerald-600";
    case "READY_FOR_REVIEW":
      return "bg-blue-600";
    case "BLOCKED":
      return "bg-red-600";
    default:
      return "bg-amber-500";
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

  /*
   * These request figures are intentionally derived only
   * from the statuses already returned by the existing
   * request service.
   */
  const outstandingRequests = requests.filter(
    (request) =>
      request.status === "SENT" ||
      request.status === "VIEWED",
  ).length;

  const submittedRequests = requests.filter(
    (request) => request.status === "SUBMITTED",
  ).length;

  const completedRequests = requests.filter(
    (request) => request.status === "COMPLETED",
  ).length;

  const incompleteRequired = Math.max(
    readiness.totalRequired -
      readiness.completedRequired,
    0,
  );

  return (
    <div className="app-page">
      {/* Back navigation */}
      <Button
        nativeButton={false}
        variant="ghost"
        size="sm"
        render={<Link href="/clients" />}
        className="-ml-2 mb-4"
      >
        <ArrowLeft className="size-4" />
        Back to clients
      </Button>

      {/* Client header */}
      <section className="overflow-hidden rounded-2xl border bg-card">
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

            <h1 className="mt-4 break-words text-2xl font-semibold tracking-[-0.035em] text-foreground sm:text-3xl">
              {clientName}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
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

      {/* Primary readiness workspace */}
      <section className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-5 border-b px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              Preparation readiness
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Current preparation status for{" "}
              {clientName}
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

            <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold tabular-nums text-emerald-700">
              {readiness.percentage}% ready
            </span>

            {readiness.status ===
            "READY_FOR_REVIEW" ? (
              <MarkTaxReadyButton
                clientId={client.id}
              />
            ) : null}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid gap-3 bg-muted/20 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
          <ReadinessMetric
            label="Requirements"
            value={`${readiness.completedRequired} / ${readiness.totalRequired}`}
            description={
              incompleteRequired > 0
                ? `${incompleteRequired} outstanding`
                : "All required items complete"
            }
            icon={ClipboardCheck}
          />

          <ReadinessMetric
            label="Requests"
            value={String(requests.length)}
            description={
              outstandingRequests > 0
                ? `${outstandingRequests} waiting on client`
                : "No client action outstanding"
            }
            icon={ClipboardList}
          />

          <ReadinessMetric
            label="Submitted"
            value={String(submittedRequests)}
            description={
              submittedRequests > 0
                ? "Awaiting practice review"
                : `${completedRequests} completed`
            }
            icon={FileCheck2}
          />

          <ReadinessMetric
            label="Exceptions"
            value={String(
              readiness.blockingExceptionCount,
            )}
            description={
              readiness.blockingExceptionCount > 0
                ? "Blocking readiness"
                : "No blocking exceptions"
            }
            icon={CircleAlert}
            danger={
              readiness.blockingExceptionCount > 0
            }
          />
        </div>

        {/* Progress + operational status */}
        <div className="border-t px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Required checklist completion
              </p>

              <p className="mt-2 text-sm text-foreground">
                <span className="font-semibold">
                  {readiness.completedRequired}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {readiness.totalRequired}
                </span>{" "}
                required items completed
              </p>
            </div>

            <p className="text-2xl font-semibold tracking-[-0.035em] tabular-nums text-foreground">
              {readiness.percentage}%
            </p>
          </div>

          <div
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              readiness.percentage
            }
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${getReadinessBarClass(
                readiness.status,
              )}`}
              style={{
                width: `${readiness.percentage}%`,
              }}
            />
          </div>

          <ReadinessMessage
            status={readiness.status}
            blockingExceptions={
              readiness.blockingExceptionCount
            }
          />
        </div>
      </section>

      {/* Client information */}
      <section className="mt-5">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div>
              <CardTitle className="text-base">
                Client details
              </CardTitle>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Identity, contact information and current
                preparation details.
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
                    value={
                      taxpayerOrEntityValue
                    }
                  />

                  <DetailRow
                    icon={FileText}
                    label={
                      isIndividual
                        ? "Profession / occupation"
                        : "Business activity"
                    }
                    value={
                      occupationOrActivity
                    }
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
                    value={String(
                      client.taxYear,
                    )}
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

      {/* Existing real checklist */}
      <section className="mt-5">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
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
          />
        </Card>
      </section>

      {/* Preserve portal management */}
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

      {/* Preserve request workflow */}
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

function ReadinessMetric({
  label,
  value,
  description,
  icon: Icon,
  danger = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof ClipboardCheck;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {label}
        </p>

        <span
          className={[
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            danger
              ? "bg-red-500/10 text-red-600"
              : "bg-primary/10 text-primary",
          ].join(" ")}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.035em] tabular-nums text-foreground">
        {value}
      </p>

      <p
        className={[
          "mt-1 text-xs leading-5",
          danger
            ? "font-medium text-red-600"
            : "text-muted-foreground",
        ].join(" ")}
      >
        {description}
      </p>
    </div>
  );
}

function ReadinessMessage({
  status,
  blockingExceptions,
}: {
  status: string;
  blockingExceptions: number;
}) {
  if (status === "TAX_READY") {
    return (
      <div className="mt-5 flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />

        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Preparation complete
          </p>

          <p className="mt-1 text-xs leading-5 text-emerald-800/80">
            This client has been marked tax-ready.
          </p>
        </div>
      </div>
    );
  }

  if (status === "BLOCKED") {
    return (
      <div className="mt-5 flex gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600" />

        <div>
          <p className="text-sm font-semibold text-red-700">
            Preparation is blocked
          </p>

          <p className="mt-1 text-xs leading-5 text-red-700/80">
            Resolve {blockingExceptions} blocking{" "}
            {blockingExceptions === 1
              ? "exception"
              : "exceptions"}{" "}
            before this client can become tax-ready.
          </p>
        </div>
      </div>
    );
  }

  if (status === "READY_FOR_REVIEW") {
    return (
      <div className="mt-5 flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-4">
        <FileCheck2 className="mt-0.5 size-4 shrink-0 text-blue-600" />

        <div>
          <p className="text-sm font-semibold text-blue-700">
            Ready for practitioner review
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700/80">
            Required preparation items are complete.
            Perform the final review before marking the
            client tax-ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />

      <div>
        <p className="text-sm font-semibold text-amber-800">
          Preparation still in progress
        </p>

        <p className="mt-1 text-xs leading-5 text-amber-800/80">
          Complete the outstanding requirements and resolve
          any preparation issues before final review.
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
    <div className="border-b bg-muted/20 px-5 py-3">
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
    <div className="grid gap-2 px-5 py-3.5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-5">
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