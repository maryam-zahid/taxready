"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");

    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: true,
    });

    if (result.error) {
      setServerError(
        result.error.message || "Invalid email or password.",
      );
      return;
    }

    const routingResponse = await fetch(
      "/api/auth/post-login",
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!routingResponse.ok) {
      setServerError(
        "Signed in successfully, but we could not open your workspace.",
      );
      return;
    }

    const routingData = (await routingResponse.json()) as {
      redirectTo: string;
    };

    router.replace(routingData.redirectTo);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2.5"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
              T
            </span>

            <span className="text-lg font-semibold tracking-tight text-foreground">
              TaxReady
            </span>
          </Link>

          <span className="text-xs text-muted-foreground sm:text-sm">
            Secure sign in
          </span>
        </div>
      </header>

      <main className="flex w-full flex-1 items-center justify-center px-4 py-5 sm:px-6 sm:py-7">
        <section className="w-full max-w-[480px] rounded-xl border border-border bg-background px-5 py-6 shadow-sm sm:px-7 sm:py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            TaxReady workspace
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Sign in to access your TaxReady workspace.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-4"
            noValidate
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
                className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
              />

              {errors.email ? (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3.5 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
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
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {serverError ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
              >
                {serverError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 border-t border-border pt-5 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Create account
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