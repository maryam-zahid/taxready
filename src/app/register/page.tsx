"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { signUp } from "@/lib/auth-client";

const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Work email is required")
      .email("Enter a valid work email"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),

    acceptedTerms: z.boolean().refine(
      (value) => value === true,
      {
        message: "You must accept the terms to continue",
      },
    ),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

type RegisterFormValues = z.infer<
  typeof registerSchema
>;

export default function RegisterPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
  });

  const onSubmit = async (
    data: RegisterFormValues,
  ) => {
    setServerError("");

    const result = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.email.split("@")[0],
    });

    if (result.error) {
      setServerError(
        result.error.message ||
          "Unable to create account. Please try again.",
      );
      return;
    }

    router.push("/onboarding/profile");
  };

  const inputClassName =
    "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/login"
            className="inline-flex min-w-0 items-center gap-2.5"
            aria-label="TaxReady login"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
              T
            </span>

            <span className="truncate text-lg font-semibold tracking-tight text-foreground">
              TaxReady
            </span>
          </Link>

          <span className="text-xs text-muted-foreground sm:text-sm">
            Secure registration
          </span>
        </div>
      </header>

      <main className="flex w-full flex-1 items-center justify-center px-4 py-5 sm:px-6 sm:py-7">
        <section className="w-full max-w-[480px] rounded-xl border border-border bg-background px-5 py-6 shadow-sm sm:px-7 sm:py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            TaxReady workspace
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Create your account
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Set up your TaxReady account to manage
            clients and prepare for tax filing.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-5 space-y-4"
          >
            <div>
              <label
                htmlFor="register-email"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Work email
              </label>

              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                {...register("email")}
                aria-invalid={Boolean(errors.email)}
                className={inputClassName}
              />

              {errors.email ? (
                <p
                  role="alert"
                  className="mt-1.5 text-xs text-destructive"
                >
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  {...register("password")}
                  aria-invalid={Boolean(
                    errors.password,
                  )}
                  className={`${inputClassName} pr-11`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current,
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {errors.password ? (
                <p
                  role="alert"
                  className="mt-1.5 text-xs text-destructive"
                >
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="register-confirm-password"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  {...register("confirmPassword")}
                  aria-invalid={Boolean(
                    errors.confirmPassword,
                  )}
                  className={`${inputClassName} pr-11`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current,
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {errors.confirmPassword ? (
                <p
                  role="alert"
                  className="mt-1.5 text-xs text-destructive"
                >
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-foreground">
                <input
                  type="checkbox"
                  {...register("acceptedTerms")}
                  aria-invalid={Boolean(
                    errors.acceptedTerms,
                  )}
                  className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
                />

                <span>
                  I agree to the Terms of Service
                  and Privacy Policy.
                </span>
              </label>

              {errors.acceptedTerms ? (
                <p
                  role="alert"
                  className="mt-1.5 text-xs text-destructive"
                >
                  {errors.acceptedTerms.message}
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          <p className="mt-5 border-t border-border pt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </section>
      </main>

      <footer className="px-4 pb-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TaxReady. All rights reserved.
      </footer>
    </div>
  );
}