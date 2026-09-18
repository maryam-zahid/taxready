"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <label>
        <div
          style={{
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          Email
        </div>

        <input
          value={email}
          readOnly
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 10,
          }}
        />
      </label>

      <label>
        <div
          style={{
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          Create password
        </div>

        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
          minLength={8}
          disabled={isSubmitting}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 10,
          }}
        />
      </label>

      <label>
        <div
          style={{
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          Confirm password
        </div>

        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          required
          minLength={8}
          disabled={isSubmitting}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 10,
          }}
        />
      </label>

      {error && (
        <p role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Activating..."
          : "Activate My Account"}
      </button>
    </form>
  );
}