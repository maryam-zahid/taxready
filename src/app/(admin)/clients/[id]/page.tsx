import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

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
import { getClientForUser } from "@/services/client.service";
import { getClientRequirementsForUser } from "@/services/compliance-requirement.service";
import { getClientRequestsForUser } from "@/services/client-request.service";
import { getClientPortalAccessForUser } from "@/services/client-invitation.service";

import { ClientRequests } from "./client-requests";
import { ComplianceChecklist } from "./compliance-checklist";
import { GenerateComplianceButton } from "./generate-compliance-button";
import { PortalAccess } from "./portal-access";

type ClientDetailPageProps = {
  params: Promise<{
    id: string;
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
  PRIVATE_LIMITED_COMPANY:
    "Private limited company",
  PUBLIC_LIMITED_COMPANY:
    "Public limited company",
  OTHER: "Other",
};

function formatClientStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
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
  switch (status) {
    case "ACTIVE":
      return "success";
    case "INACTIVE":
      return "neutral";
    default:
      return "info";
  }
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const client = await getClientForUser(
    session.user.id,
    id,
  );

  if (!client) {
    notFound();
  }

  const [requirements, requests, portalData] =
    await Promise.all([
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
    ]);

  const clientName =
    client.type === "INDIVIDUAL"
      ? `${client.firstName ?? ""} ${
          client.lastName ?? ""
        }`.trim() || "Unnamed client"
      : client.businessName ?? "Unnamed business";

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
    }),
  );

  const isIndividual =
    client.type === "INDIVIDUAL";

  const clientTypeLabel = isIndividual
    ? "Individual client"
    : "Business client";

  const portalStatus =
    portalData.portalAccess?.status ??
    "NOT_INVITED";

  return (
    <div className="app-page">
      <div className="mb-5">
      <Button
  nativeButton={false}
  variant="ghost"
  size="sm"
  render={<Link href="/clients" />}
  className="-ml-2 text-muted-foreground"
>
          <ArrowLeft className="size-4" />
          Back to clients
        </Button>
      </div>

      <PageHeader
        title={clientName}
        description={`${clientTypeLabel} · Tax year ${client.taxYear}`}
        actions={
          <Button
  nativeButton={false}
  render={
    <Link
      href={`/clients/${client.id}/tax-profile`}
    />
  }
>
  Complete tax profile
</Button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <StatusBadge
          tone={getClientStatusTone(
            client.status,
          )}
        >
          {formatClientStatus(client.status)}
        </StatusBadge>

        <StatusBadge>
          {isIndividual
            ? "Individual"
            : "Business"}
        </StatusBadge>

        <StatusBadge
          tone={
            portalStatus === "ACTIVE"
              ? "success"
              : portalStatus === "INVITED"
                ? "info"
                : "neutral"
          }
        >
          Portal{" "}
          {formatClientStatus(portalStatus)}
        </StatusBadge>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-4 desktop:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
<Card className="border-border bg-card shadow-xs">
            <CardHeader className="border-b">
            <CardTitle className="text-base">
              Client information
            </CardTitle>

            <p className="text-sm leading-5 text-muted-foreground">
              Primary identity and contact details
              for this client.
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-1 tablet:grid-cols-2">
              <InfoItem
                icon={Mail}
                label="Email"
                value={client.email}
              />

              <InfoItem
                icon={Phone}
                label="Phone"
                value={
                  client.phone ||
                  "Not provided"
                }
                borderLeft
              />

              <div className="tablet:col-span-2">
                <Separator />
              </div>

              <InfoItem
                icon={
                  isIndividual
                    ? UserRound
                    : Building2
                }
                label={
                  isIndividual
                    ? "Taxpayer type"
                    : "Entity type"
                }
                value={
                  isIndividual
                    ? client.taxpayerType
                      ? taxpayerTypeLabels[
                          client.taxpayerType
                        ] ??
                        formatClientStatus(
                          client.taxpayerType,
                        )
                      : "Not provided"
                    : client.entityType
                      ? entityTypeLabels[
                          client.entityType
                        ] ??
                        formatClientStatus(
                          client.entityType,
                        )
                      : "Not provided"
                }
              />

              <InfoItem
                icon={BriefcaseBusiness}
                label={
                  isIndividual
                    ? "Profession / occupation"
                    : "Business activity"
                }
                value={
                  isIndividual
                    ? client.occupation ||
                      "Not provided"
                    : client.businessActivity ||
                      "Not provided"
                }
                borderLeft
              />

              {!isIndividual ? (
                <>
                  <div className="tablet:col-span-2">
                    <Separator />
                  </div>

                  <InfoItem
                    icon={UserRound}
                    label="Contact person"
                    value={
                      client.contactPerson ||
                      "Not provided"
                    }
                  />
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>

<Card className="border-border bg-card shadow-xs">
            <CardHeader className="border-b">
            <CardTitle className="text-base">
              Preparation
            </CardTitle>

            <p className="text-sm leading-5 text-muted-foreground">
              Key preparation details for the
              current engagement.
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <PreparationItem
              label="Tax year"
              value={String(client.taxYear)}
            />

            <Separator />

            <PreparationItem
              label="NTN / registration"
              value={
                client.ntn || "Not provided"
              }
            />

            <Separator />

            <PreparationItem
              label="Internal deadline"
              value={
                client.preparationDeadline
                  ? new Intl.DateTimeFormat(
                      "en",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    ).format(
                      client.preparationDeadline,
                    )
                  : "Not set"
              }
              icon
            />

            <Separator />

            <PreparationItem
              label="Portal setup"
              value={
                client.sendPortalInvitation
                  ? "Requested"
                  : "Not requested"
              }
            />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
<Card className="border-border bg-card shadow-xs">
            <CardHeader className="border-b">
            <div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between">
              <div>
                <CardTitle className="text-base">
                  Compliance checklist
                </CardTitle>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Requirements generated from
                  this client&apos;s saved tax
                  profile.
                </p>
              </div>

              <GenerateComplianceButton
  clientId={client.id}
  hasRequirements={requirements.length > 0}
  hasTaxProfile={Boolean(client.taxProfile)}
/>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ComplianceChecklist
              requirements={requirements}
            />
          </CardContent>
        </Card>
      </section>

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
        clientId={id}
        requirements={
          requestRequirementOptions
        }
        requests={requestItems}
      />
    </div>
  );
}

type InfoItemProps = {
  icon: typeof Mail;
  label: string;
  value: string;
  borderLeft?: boolean;
};

function InfoItem({
  icon: Icon,
  label,
  value,
  borderLeft = false,
}: InfoItemProps) {
  return (
    <div
      className={`flex min-w-0 gap-3 px-4 py-4 tablet:px-5 ${
        borderLeft
          ? "tablet:border-l"
          : ""
      }`}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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

type PreparationItemProps = {
  label: string;
  value: string;
  icon?: boolean;
};

function PreparationItem({
  label,
  value,
  icon = false,
}: PreparationItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex min-w-0 items-center gap-2">
        {icon ? (
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        ) : null}

        <p className="text-sm text-muted-foreground">
          {label}
        </p>
      </div>

      <p className="max-w-[55%] break-words text-right text-sm font-medium">
        {value}
      </p>
    </div>
  );
}