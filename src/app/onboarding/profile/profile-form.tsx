"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { saveProfileAction } from "./actions";
import {
  authProfileSchema,
  type AuthProfileInput,
} from "@/lib/validations/auth-profile";

type ProfileFormProps = {
  email: string;
  initialValues: AuthProfileInput;
};

export function ProfileForm({
  email,
  initialValues,
}: ProfileFormProps) {
  const router = useRouter();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthProfileInput>({
    resolver: zodResolver(authProfileSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: AuthProfileInput) => {
    setServerError("");

    const result = await saveProfileAction(data);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    router.push("/onboarding/firm");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 space-y-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
       
     
 <div>
          <label
            htmlFor="firstName"
            className="mb-2 block text-sm font-medium text-black"
          >
            First Name
          </label>

          <input
            id="firstName"
            {...register("firstName")}
            placeholder="Maryam"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black"
          />

          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="mb-2 block text-sm font-medium text-black"
          >
            Last Name
          </label>

          <input
            id="lastName"
            {...register("lastName")}
            placeholder="Zahid"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black"
          />

          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-black"
        >
          Work Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-600"
        />

        <p className="mt-1 text-xs text-gray-500">
          This email is linked to your TaxReady account.
        </p>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-medium text-black"
        >
          Phone Number
          <span className="ml-1 font-normal text-gray-500">
            (Optional)
          </span>
        </label>

        <input
          id="phone"
          type="tel"
          {...register("phone")}
          placeholder="+92 300 1234567"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black"
        />

        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">
            {errors.phone.message}
          </p>
        )}
      </div>

     
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-black"
        >
          Back
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </div>
    </form>
  );
}