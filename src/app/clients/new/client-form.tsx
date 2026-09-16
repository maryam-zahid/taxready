"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  clientSchema,
  type ClientInput,
} from "@/lib/validations/client";
import { createClientAction } from "../actions";

export function ClientForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
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

  const isIndividual =
    clientType === "INDIVIDUAL";

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="type"
          className="mb-1 block text-sm font-medium"
        >
          Client Type *
        </label>

        <select
          id="type"
          {...register("type")}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="INDIVIDUAL">
            Individual
          </option>

          <option value="BUSINESS">
            Business
          </option>
        </select>
      </div>

      {isIndividual ? (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium">
              First Name *
            </label>

            <input
              {...register("firstName")}
              className="w-full rounded-md border px-3 py-2"
            />

            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Last Name *
            </label>

            <input
              {...register("lastName")}
              className="w-full rounded-md border px-3 py-2"
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Taxpayer Type *
            </label>

            <select
              {...register("taxpayerType")}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="SALARIED_INDIVIDUAL">
                Salaried Individual
              </option>

              <option value="FREELANCER_PROFESSIONAL">
                Freelancer / Professional
              </option>

              <option value="SOLE_PROPRIETOR">
                Sole Proprietor
              </option>

              <option value="OTHER_INDIVIDUAL">
                Other Individual
              </option>
            </select>

            {errors.taxpayerType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.taxpayerType.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Profession / Occupation
            </label>

            <input
              {...register("occupation")}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Business / Legal Name *
            </label>

            <input
              {...register("businessName")}
              className="w-full rounded-md border px-3 py-2"
            />

            {errors.businessName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.businessName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Contact Person *
            </label>

            <input
              {...register("contactPerson")}
              className="w-full rounded-md border px-3 py-2"
            />

            {errors.contactPerson && (
              <p className="mt-1 text-sm text-red-600">
                {errors.contactPerson.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Entity Type *
            </label>

            <select
              {...register("entityType")}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">
                Select entity type
              </option>

              <option value="PARTNERSHIP_AOP">
                Partnership / AOP
              </option>

              <option value="PRIVATE_LIMITED_COMPANY">
                Private Limited Company
              </option>

              <option value="PUBLIC_LIMITED_COMPANY">
                Public Limited Company
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>

            {errors.entityType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.entityType.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Business Activity *
            </label>

            <input
              {...register("businessActivity")}
              placeholder="e.g. Software services"
              className="w-full rounded-md border px-3 py-2"
            />

            {errors.businessActivity && (
              <p className="mt-1 text-sm text-red-600">
                {errors.businessActivity.message}
              </p>
            )}
          </div>
        </>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Email *
        </label>

        <input
          type="email"
          {...register("email")}
          className="w-full rounded-md border px-3 py-2"
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Phone
        </label>

        <input
          type="tel"
          {...register("phone")}
          className="w-full rounded-md border px-3 py-2"
        />

        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          NTN / Registration Number
        </label>

        <input
          {...register("ntn")}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Tax Year *
        </label>

        <input
          type="number"
          {...register("taxYear", {
            valueAsNumber: true,
          })}
          className="w-full rounded-md border px-3 py-2"
        />

        {errors.taxYear && (
          <p className="mt-1 text-sm text-red-600">
            {errors.taxYear.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Internal Preparation Deadline
        </label>

        <input
          type="date"
          {...register("preparationDeadline")}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("sendPortalInvitation")}
        />

        <span className="text-sm">
          Send portal invitation
        </span>
      </label>

      {serverError && (
        <p className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/clients")}
          className="rounded-md border px-4 py-2"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting
            ? "Creating..."
            : "Create Client"}
        </button>
      </div>
    </form>
  );
}