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

  const inputClassName =
    "h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-6 space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label
            htmlFor="firstName"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            First name
          </label>

          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            {...register("firstName")}
            placeholder="Enter your first name"
            aria-invalid={Boolean(errors.firstName)}
            className={inputClassName}
          />

          {errors.firstName ? (
            <p
              role="alert"
              className="mt-1.5 text-xs text-destructive"
            >
              {errors.firstName.message}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <label
            htmlFor="lastName"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Last name
          </label>

          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            {...register("lastName")}
            placeholder="Enter your last name"
            aria-invalid={Boolean(errors.lastName)}
            className={inputClassName}
          />

          {errors.lastName ? (
            <p
              role="alert"
              className="mt-1.5 text-xs text-destructive"
            >
              {errors.lastName.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Work email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          readOnly
          autoComplete="email"
          aria-describedby="email-help"
          className="h-11 w-full cursor-not-allowed rounded-lg border border-primary/15 bg-primary/5 px-3.5 text-sm text-foreground outline-none"
        />

        <p
          id="email-help"
          className="mt-1.5 text-xs text-muted-foreground"
        >
          This email is linked to your TaxReady account
          and cannot be changed here.
        </p>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Phone number
          <span className="ml-1 font-normal text-muted-foreground">
            (Optional)
          </span>
        </label>

        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          {...register("phone")}
          placeholder="+92 300 1234567"
          aria-invalid={Boolean(errors.phone)}
          className={inputClassName}
        />

        {errors.phone ? (
          <p
            role="alert"
            className="mt-1.5 text-xs text-destructive"
          >
            {errors.phone.message}
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
          onClick={() => router.back()}
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