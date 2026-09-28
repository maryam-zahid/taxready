"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { authClient } from "@/lib/auth-client";

type InviteActivationFormProps = {
  token: string;
  email: string;
  clientName: string;
};

export function InviteActivationForm({
  token,
  email,
  clientName,
}: InviteActivationFormProps) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: signUpError } =
        await authClient.signUp.email({
          name: clientName,
          email,
          password,
        });

      if (signUpError) {
        if (
          signUpError.code === "USER_ALREADY_EXISTS"
        ) {
          setError(
            "An account already exists for this email. Please sign in to activate your portal.",
          );
          return;
        }

        setError(
          signUpError.message ||
            "Unable to create your account.",
        );
        return;
      }

      const response = await fetch(
        "/api/client-portal/activate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to activate your portal.",
        );
        return;
      }

      router.replace("/portal");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong while activating your portal.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
className="mt-5 space-y-4"
    >
      <div>
        <label
          htmlFor="activation-password"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Password
        </label>

        <div className="relative">
          <input
            id="activation-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);

              if (error) {
                setError(null);
              }
            }}
            required
            disabled={isSubmitting}
            placeholder="Enter your password"
            className="h-11 w-full rounded-lg border border-input bg-background px-3.5 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((current) => !current)
            }
            disabled={isSubmitting}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 disabled:cursor-not-allowed"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="activation-confirm-password"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Confirm password
        </label>

        <div className="relative">
          <input
            id="activation-confirm-password"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(
                event.target.value,
              );

              if (error) {
                setError(null);
              }
            }}
            required
            disabled={isSubmitting}
            placeholder="Confirm your password"
            className="h-11 w-full rounded-lg border border-input bg-background px-3.5 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (current) => !current,
              )
            }
            disabled={isSubmitting}
            aria-label={
              showConfirmPassword
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={showConfirmPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 disabled:cursor-not-allowed"
          >
            {showConfirmPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Activating your account..."
          : "Activate My Account"}
      </button>

      <p className="text-xs leading-5 text-muted-foreground">
        By activating your account, you agree to
        TaxReady&apos;s Terms of Service and Privacy
        Policy.
      </p>
    </form>
  );
}