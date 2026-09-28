"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  organizationSchema,
  type OrganizationInput,
} from "@/lib/validations/organization";

import { saveOrganizationAction } from "./actions";

type FirmFormProps = {
  initialValues: OrganizationInput;
};

export function FirmForm({
  initialValues,
}: FirmFormProps) {
  const router = useRouter();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationInput>({
    resolver: zodResolver(organizationSchema),
    defaultValues: initialValues,
  });

  const practiceType = watch("practiceType");

  const isIndependent =
    practiceType === "INDEPENDENT_TAX_PROFESSIONAL";

  const isFirm =
    practiceType === "TAX_ACCOUNTING_FIRM";

  const onSubmit = async (
    data: OrganizationInput,
  ) => {
    setServerError("");

    const result = await saveOrganizationAction(data);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const inputClassName =
    "h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

  const textareaClassName =
    "min-h-24 w-full min-w-0 resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

  const labelClassName =
    "mb-2 block text-sm font-medium text-foreground";

  const errorClassName =
    "mt-1.5 text-xs text-destructive";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-6 space-y-5"
    >
      <div>
        <label
          htmlFor="practiceType"
          className={labelClassName}
        >
          How do you work?{" "}
          <span className="text-destructive">*</span>
        </label>

        <select
          id="practiceType"
          {...register("practiceType")}
          aria-invalid={Boolean(errors.practiceType)}
          className={inputClassName}
        >
          <option value="INDEPENDENT_TAX_PROFESSIONAL">
            Independent Tax Professional
          </option>

          <option value="TAX_ACCOUNTING_FIRM">
            Tax / Accounting Firm
          </option>

          <option value="OTHER">
            Other
          </option>
        </select>

        {errors.practiceType ? (
          <p role="alert" className={errorClassName}>
            {errors.practiceType.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="name"
          className={labelClassName}
        >
          {isFirm
            ? "Firm name"
            : isIndependent
              ? "Practice / business name"
              : "Practice / workspace name"}{" "}
          {!isIndependent ? (
            <span className="text-destructive">*</span>
          ) : null}
        </label>

        <input
          id="name"
          type="text"
          {...register("name")}
          placeholder={
            isFirm
              ? "ABC Tax Consultants"
              : isIndependent
                ? "Optional"
                : "Enter workspace name"
          }
          aria-invalid={Boolean(errors.name)}
          className={inputClassName}
        />

        {isIndependent ? (
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            Optional. If left blank, your name will
            be used for your workspace.
          </p>
        ) : null}

        {errors.name ? (
          <p role="alert" className={errorClassName}>
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <label
            htmlFor="businessEmail"
            className={labelClassName}
          >
            Business email{" "}
            {isFirm ? (
              <span className="text-destructive">*</span>
            ) : null}
          </label>

          <input
            id="businessEmail"
            type="email"
            autoComplete="email"
            {...register("businessEmail")}
            placeholder="info@example.com"
            aria-invalid={Boolean(errors.businessEmail)}
            className={inputClassName}
          />

          {errors.businessEmail ? (
            <p role="alert" className={errorClassName}>
              {errors.businessEmail.message}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <label
            htmlFor="businessPhone"
            className={labelClassName}
          >
            Business phone{" "}
            {isFirm ? (
              <span className="text-destructive">*</span>
            ) : null}
          </label>

          <input
            id="businessPhone"
            type="tel"
            autoComplete="tel"
            {...register("businessPhone")}
            placeholder="+92 300 1234567"
            aria-invalid={Boolean(errors.businessPhone)}
            className={inputClassName}
          />

          {errors.businessPhone ? (
            <p role="alert" className={errorClassName}>
              {errors.businessPhone.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <label
            htmlFor="ntn"
            className={labelClassName}
          >
            NTN{" "}
            <span className="font-normal text-muted-foreground">
              (Optional)
            </span>
          </label>

          <input
            id="ntn"
            type="text"
            {...register("ntn")}
            placeholder="Enter NTN"
            aria-invalid={Boolean(errors.ntn)}
            className={inputClassName}
          />

          {errors.ntn ? (
            <p role="alert" className={errorClassName}>
              {errors.ntn.message}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <label
            htmlFor="country"
            className={labelClassName}
          >
            Country{" "}
            <span className="text-destructive">*</span>
          </label>

          <input
            id="country"
            type="text"
            autoComplete="country-name"
            {...register("country")}
            aria-invalid={Boolean(errors.country)}
            className={inputClassName}
          />

          {errors.country ? (
            <p role="alert" className={errorClassName}>
              {errors.country.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="city"
          className={labelClassName}
        >
          City
        </label>

        <input
          id="city"
          type="text"
          autoComplete="address-level2"
          {...register("city")}
          placeholder="Lahore"
          aria-invalid={Boolean(errors.city)}
          className={inputClassName}
        />

        {errors.city ? (
          <p role="alert" className={errorClassName}>
            {errors.city.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="address"
          className={labelClassName}
        >
          {isFirm ? "Business address" : "Address"}
        </label>

        <textarea
          id="address"
          {...register("address")}
          rows={3}
          autoComplete="street-address"
          placeholder="Enter your business address"
          aria-invalid={Boolean(errors.address)}
          className={textareaClassName}
        />

        {errors.address ? (
          <p role="alert" className={errorClassName}>
            {errors.address.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="website"
          className={labelClassName}
        >
          Website{" "}
          <span className="font-normal text-muted-foreground">
            (Optional)
          </span>
        </label>

        <input
          id="website"
          type="url"
          autoComplete="url"
          {...register("website")}
          placeholder="https://example.com"
          aria-invalid={Boolean(errors.website)}
          className={inputClassName}
        />

        {errors.website ? (
          <p role="alert" className={errorClassName}>
            {errors.website.message}
          </p>
        ) : null}
      </div>

      {serverError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-sm leading-5 text-destructive"
        >
          {serverError}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() =>
            router.push("/onboarding/profile")
          }
          disabled={isSubmitting}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-input bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Back
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </div>
    </form>
  );
}