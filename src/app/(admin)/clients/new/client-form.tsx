"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CalendarDays,
  Check,
  CircleAlert,
  Mail,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientSchema, type ClientInput } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

import { createClientAction } from "../actions";

export function ClientForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: "INDIVIDUAL",

      firstName: "",
      lastName: "",

      businessName: "",
      contactPerson: "",

      email: "",
      phone: "",
      ntn: "",

      taxpayerType: "SALARIED_INDIVIDUAL",
      entityType: null,

      occupation: "",
      businessActivity: "",

      taxYear: currentYear,

      preparationDeadline: "",

      sendPortalInvitation: true,
    },
  });

  const clientType = watch("type");
  const sendPortalInvitation = watch("sendPortalInvitation");

  const isIndividual = clientType === "INDIVIDUAL";

  async function onSubmit(data: ClientInput) {
    setServerError("");

    const result = await createClientAction(data);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    router.push(`/clients/${result.clientId}`);
    router.refresh();
  }

  function selectClientType(type: "INDIVIDUAL" | "BUSINESS") {
    setValue("type", type, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setServerError("");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base">Client type</CardTitle>

          <p className="text-sm leading-5 text-muted-foreground">
            Select the type of taxpayer you are adding.
          </p>
        </CardHeader>

        <CardContent className="p-4 tablet:p-5">
          <div className="grid grid-cols-1 gap-3 min-[560px]:grid-cols-2">
            <ClientTypeOption
              active={isIndividual}
              title="Individual"
              description="Salaried individuals, professionals, freelancers and sole proprietors."
              icon={UserRound}
              onClick={() => selectClientType("INDIVIDUAL")}
            />

            <ClientTypeOption
              active={!isIndividual}
              title="Business"
              description="Partnerships, AOPs and incorporated companies."
              icon={Building2}
              onClick={() => selectClientType("BUSINESS")}
            />
          </div>

          <input type="hidden" {...register("type")} />
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base">
            {isIndividual ? "Client information" : "Business information"}
          </CardTitle>

          <p className="text-sm leading-5 text-muted-foreground">
            {isIndividual
              ? "Enter the client's basic identity and contact information."
              : "Enter the business and primary contact information."}
          </p>
        </CardHeader>

        <CardContent className="p-4 tablet:p-5">
          <div className="grid grid-cols-1 gap-x-5 gap-y-5 tablet:grid-cols-2">
            {isIndividual ? (
              <>
                <FormField
                  label="First name"
                  htmlFor="firstName"
                  required
                  error={errors.firstName?.message}
                >
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    placeholder="Enter first name"
                    aria-invalid={!!errors.firstName}
                    {...register("firstName")}
                  />
                </FormField>

                <FormField
                  label="Last name"
                  htmlFor="lastName"
                  required
                  error={errors.lastName?.message}
                >
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    placeholder="Enter last name"
                    aria-invalid={!!errors.lastName}
                    {...register("lastName")}
                  />
                </FormField>
              </>
            ) : (
              <>
                <FormField
                  label="Business / legal name"
                  htmlFor="businessName"
                  required
                  error={errors.businessName?.message}
                >
                  <Input
                    id="businessName"
                    autoComplete="organization"
                    placeholder="Enter legal business name"
                    aria-invalid={!!errors.businessName}
                    {...register("businessName")}
                  />
                </FormField>

                <FormField
                  label="Contact person"
                  htmlFor="contactPerson"
                  required
                  error={errors.contactPerson?.message}
                >
                  <Input
                    id="contactPerson"
                    autoComplete="name"
                    placeholder="Enter contact person's name"
                    aria-invalid={!!errors.contactPerson}
                    {...register("contactPerson")}
                  />
                </FormField>
              </>
            )}

            <FormField
              label="Email address"
              htmlFor="email"
              required
              error={errors.email?.message}
            >
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="client@example.com"
                  className="pl-9"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </div>
            </FormField>

            <FormField
              label="Phone"
              htmlFor="phone"
              error={errors.phone?.message}
            >
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="e.g. +92 300 1234567"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base">Tax information</CardTitle>

          <p className="text-sm leading-5 text-muted-foreground">
            Add the basic information needed to start this client&apos;s tax
            preparation workflow.
          </p>
        </CardHeader>

        <CardContent className="p-4 tablet:p-5">
          <div className="grid grid-cols-1 gap-x-5 gap-y-5 tablet:grid-cols-2">
            {isIndividual ? (
              <>
                <FormField
                  label="Taxpayer type"
                  htmlFor="taxpayerType"
                  required
                  error={errors.taxpayerType?.message}
                >
                  <select
                    id="taxpayerType"
                    {...register("taxpayerType")}
                    className={selectClassName}
                    aria-invalid={!!errors.taxpayerType}
                  >
                    <option value="SALARIED_INDIVIDUAL">
                      Salaried individual
                    </option>

                    <option value="FREELANCER_PROFESSIONAL">
                      Freelancer / Professional
                    </option>

                    <option value="SOLE_PROPRIETOR">Sole proprietor</option>

                    <option value="OTHER_INDIVIDUAL">Other individual</option>
                  </select>
                </FormField>

                <FormField label="Profession / occupation" htmlFor="occupation">
                  <Input
                    id="occupation"
                    placeholder="e.g. Physician"
                    {...register("occupation")}
                  />
                </FormField>
              </>
            ) : (
              <>
                <FormField
                  label="Entity type"
                  htmlFor="entityType"
                  required
                  error={errors.entityType?.message}
                >
                  <select
                    id="entityType"
                    {...register("entityType")}
                    className={selectClassName}
                    aria-invalid={!!errors.entityType}
                  >
                    <option value="">Select entity type</option>

                    <option value="PARTNERSHIP_AOP">Partnership / AOP</option>

                    <option value="PRIVATE_LIMITED_COMPANY">
                      Private limited company
                    </option>

                    <option value="PUBLIC_LIMITED_COMPANY">
                      Public limited company
                    </option>

                    <option value="OTHER">Other</option>
                  </select>
                </FormField>

                <FormField
                  label="Business activity"
                  htmlFor="businessActivity"
                  required
                  error={errors.businessActivity?.message}
                >
                  <Input
                    id="businessActivity"
                    placeholder="e.g. Software services"
                    aria-invalid={!!errors.businessActivity}
                    {...register("businessActivity")}
                  />
                </FormField>
              </>
            )}

            <FormField
              label="NTN / registration number"
              htmlFor="ntn"
              hint="Optional"
            >
              <Input
                id="ntn"
                placeholder="Enter NTN or registration number"
                {...register("ntn")}
              />
            </FormField>

            <FormField
              label="Tax year"
              htmlFor="taxYear"
              required
              error={errors.taxYear?.message}
            >
              <Input
                id="taxYear"
                type="number"
                min={2000}
                max={2100}
                inputMode="numeric"
                aria-invalid={!!errors.taxYear}
                {...register("taxYear", {
                  valueAsNumber: true,
                })}
              />
            </FormField>

            <div className="tablet:col-span-2 tablet:max-w-[calc(50%-0.625rem)]">
              <FormField
                label="Internal preparation deadline"
                htmlFor="preparationDeadline"
                hint="Optional"
              >
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="preparationDeadline"
                    type="date"
                    className="pl-9"
                    {...register("preparationDeadline")}
                  />
                </div>
              </FormField>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base">Client portal</CardTitle>

          <p className="text-sm leading-5 text-muted-foreground">
            Control whether this client should enter the portal invitation
            workflow.
          </p>
        </CardHeader>

        <CardContent className="p-4 tablet:p-5">
          <label
            htmlFor="sendPortalInvitation"
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all duration-150",
              "hover:bg-muted/35",
              sendPortalInvitation
                ? "border-primary/30 bg-primary/[0.035]"
                : "border-border bg-card",
            )}
          >
            <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
              <input
                id="sendPortalInvitation"
                type="checkbox"
                {...register("sendPortalInvitation")}
                className="peer size-5 cursor-pointer appearance-none rounded border border-input bg-background transition-colors checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
              />

              <Check className="pointer-events-none absolute size-3.5 scale-75 text-primary-foreground opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                Send portal invitation
              </span>

              <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                Prepare this client for secure portal access so they can respond
                to requests and provide tax information.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      {serverError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/[0.04] p-4 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" />

          <p className="leading-5">{serverError}</p>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t pt-5 min-[480px]:flex-row min-[480px]:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.push("/clients")}
          className="w-full min-[480px]:w-auto"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-[480px]:w-auto"
        >
          {isSubmitting ? "Creating client..." : "Create client"}
        </Button>
      </div>
    </form>
  );
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-foreground/25 focus:border-primary focus:ring-[3px] focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/10";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
};

function FormField({
  label,
  htmlFor,
  children,
  error,
  hint,
  required = false,
}: FormFieldProps) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <Label htmlFor={htmlFor}>
          {label}
          {required ? (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
        </Label>

        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>

      {children}

      {error ? (
        <p role="alert" className="mt-1.5 text-xs leading-5 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type ClientTypeOptionProps = {
  active: boolean;
  title: string;
  description: string;
  icon: typeof UserRound;
  onClick: () => void;
};

function ClientTypeOption({
  active,
  title,
  description,
  icon: Icon,
  onClick,
}: ClientTypeOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative flex min-h-[112px] w-full items-start gap-3 rounded-xl border p-4 text-left",
        "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
        active
          ? "border-primary/40 bg-primary/[0.045]"
          : "border-border bg-card hover:border-primary/20 hover:bg-muted/35",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground group-hover:text-foreground",
        )}
      >
        <Icon className="size-[18px]" strokeWidth={1.9} />
      </span>

      <span className="min-w-0 pr-5">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>

      {active ? (
        <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" />
        </span>
      ) : null}
    </button>
  );
}
