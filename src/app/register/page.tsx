"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { signUp } from "@/lib/auth-client";

const registerSchema = z
  .object({
    email: z.string().email("Enter a valid work email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    acceptedTerms: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");

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

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError("");

    const result = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.email.split("@")[0],
    });

    if (result.error) {
      setServerError(
        result.error.message || "Unable to create account. Please try again."
      );
      return;
    }

    router.push("/onboarding/profile");
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold text-black">
          Create your TaxReady account
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Start your tax practice setup.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5"
        >
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
              autoComplete="email"
              {...register("email")}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-black"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-black"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black"
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                {...register("acceptedTerms")}
                className="mt-1"
              />

              <span>
                I agree to the Terms of Service and Privacy Policy.
              </span>
            </label>

            {errors.acceptedTerms && (
              <p className="mt-1 text-sm text-red-600">
                {errors.acceptedTerms.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}