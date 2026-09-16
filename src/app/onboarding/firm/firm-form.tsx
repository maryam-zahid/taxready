"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
    formState: {
      errors,
      isSubmitting,
    },
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
    data: OrganizationInput
  ) => {
    setServerError("");

    const result =
      await saveOrganizationAction(data);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="practiceType"
          className="mb-1 block text-sm font-medium"
        >
          How do you work? *
        </label>

        <select
          id="practiceType"
          {...register("practiceType")}
          className="w-full rounded-md border px-3 py-2"
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

        {errors.practiceType && (
          <p className="mt-1 text-sm text-red-600">
            {errors.practiceType.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium"
        >
          {isFirm
            ? "Firm Name *"
            : isIndependent
              ? "Practice / Business Name"
              : "Practice / Workspace Name *"}
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
          className="w-full rounded-md border px-3 py-2"
        />

        {isIndependent && (
          <p className="mt-1 text-xs text-gray-500">
            Optional. If left blank, your name will
            be used for your workspace.
          </p>
        )}

        {errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="businessEmail"
          className="mb-1 block text-sm font-medium"
        >
          Business Email {isFirm ? "*" : ""}
        </label>

        <input
          id="businessEmail"
          type="email"
          {...register("businessEmail")}
          placeholder="info@example.com"
          className="w-full rounded-md border px-3 py-2"
        />

        {errors.businessEmail && (
          <p className="mt-1 text-sm text-red-600">
            {errors.businessEmail.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="businessPhone"
          className="mb-1 block text-sm font-medium"
        >
          Business Phone {isFirm ? "*" : ""}
        </label>

        <input
          id="businessPhone"
          type="tel"
          {...register("businessPhone")}
          placeholder="+92 300 1234567"
          className="w-full rounded-md border px-3 py-2"
        />

        {errors.businessPhone && (
          <p className="mt-1 text-sm text-red-600">
            {errors.businessPhone.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="ntn"
          className="mb-1 block text-sm font-medium"
        >
          NTN
        </label>

        <input
          id="ntn"
          type="text"
          {...register("ntn")}
          placeholder="Optional"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="country"
          className="mb-1 block text-sm font-medium"
        >
          Country *
        </label>

        <input
          id="country"
          type="text"
          {...register("country")}
          className="w-full rounded-md border px-3 py-2"
        />

        {errors.country && (
          <p className="mt-1 text-sm text-red-600">
            {errors.country.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="city"
          className="mb-1 block text-sm font-medium"
        >
          City
        </label>

        <input
          id="city"
          type="text"
          {...register("city")}
          placeholder="Lahore"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-1 block text-sm font-medium"
        >
          {isFirm
            ? "Business Address"
            : "Address"}
        </label>

        <textarea
          id="address"
          {...register("address")}
          rows={3}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="website"
          className="mb-1 block text-sm font-medium"
        >
          Website
        </label>

        <input
          id="website"
          type="url"
          {...register("website")}
          placeholder="https://example.com"
          className="w-full rounded-md border px-3 py-2"
        />

        {errors.website && (
          <p className="mt-1 text-sm text-red-600">
            {errors.website.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() =>
            router.push("/onboarding/profile")
          }
          className="rounded-md border px-4 py-2"
        >
          Back
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : "Continue"}
        </button>
      </div>
    </form>
  );
}