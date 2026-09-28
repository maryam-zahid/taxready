"use client";

import {
  Check,
  CircleAlert,
  FileCheck2,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { MotionReveal } from "@/components/homepage/motion-reveal";

export function ReadinessSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="readiness"
      className="overflow-hidden bg-[#f7f9fb] py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 lg:px-8 xl:gap-20">
        {/* READINESS PREVIEW */}
        <MotionReveal>
          <ReadinessPreview />
        </MotionReveal>

        {/* CONTENT */}
        <MotionReveal delay={0.08}>
          <div className="max-w-[520px]">
            <h2 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.045em] text-foreground sm:text-[38px] lg:text-[44px]">
              Know when a client file is ready for preparation.
            </h2>

            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Give your practice a clear view of preparation
              progress before return work moves forward. TaxReady
              brings requests, submitted documents, review status,
              checklist completion, and unresolved issues into one
              readiness view.
            </p>

            <div className="mt-8 space-y-4">
              <ReadinessBenefit>
                See what has been requested, submitted, reviewed,
                and approved for each client.
              </ReadinessBenefit>

              <ReadinessBenefit>
                Identify unresolved issues and missing information
                before they delay preparation.
              </ReadinessBenefit>

              <ReadinessBenefit>
                Complete preparation checks and generate a
                preparation package when the client file is ready.
              </ReadinessBenefit>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}

function ReadinessPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -3,
            }
      }
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative mx-auto max-w-[650px]"
    >
      {/* Subtle background depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[36px] bg-primary/[0.035] blur-2xl"
      />

      <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.10)]">
        {/* Preview header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.09] text-primary">
              <FileCheck2
                className="size-[18px]"
                strokeWidth={1.9}
              />
            </span>

            <div>
              <p className="text-sm font-semibold text-foreground">
                Preparation readiness
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Ahmad Trading · FY 2025–26
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-warning-muted px-3 py-1.5 text-[11px] font-semibold text-warning-foreground">
            Review in progress
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {/* Main readiness summary */}
          <div className="grid gap-6 sm:grid-cols-[170px_1fr] sm:items-center">
            {/* Progress ring */}
            <div className="flex justify-center sm:justify-start">
              <div className="relative flex size-[150px] shrink-0 items-center justify-center">
                <svg
                  viewBox="0 0 120 120"
                  className="size-full -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    className="text-slate-100"
                  />

                  <motion.circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                    className="text-primary"
                    initial={
                      reduceMotion
                        ? {
                            pathLength: 0.82,
                          }
                        : {
                            pathLength: 0,
                          }
                    }
                    whileInView={{
                      pathLength: 0.82,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.5,
                    }}
                    transition={{
                      duration: reduceMotion ? 0 : 1.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </svg>

                <div className="absolute text-center">
                  <p className="text-[32px] font-semibold leading-none tracking-[-0.05em] text-foreground">
                    82%
                  </p>

                  <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                    preparation ready
                  </p>
                </div>
              </div>
            </div>

            {/* Progress details */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Client file progress
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Readiness reflects collection, review, and
                preparation checks.
              </p>

              <div className="mt-4 space-y-3">
                <StatusLine
                  label="Checklist"
                  value="8 / 10"
                  complete
                />

                <StatusLine
                  label="Documents reviewed"
                  value="10 / 12"
                  complete
                />

                <StatusLine
                  label="Open requests"
                  value="2"
                />

                <StatusLine
                  label="Unresolved issues"
                  value="2"
                />
              </div>
            </div>
          </div>

          {/* Attention area */}
          <div className="mt-6 rounded-2xl border border-warning/20 bg-warning-muted/70 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-warning">
                <CircleAlert
                  className="size-4"
                  strokeWidth={1.9}
                />
              </span>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  2 items require attention
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Resolve the remaining information and review
                  issues before marking this client
                  preparation-ready.
                </p>
              </div>
            </div>
          </div>

          {/* Preparation checks */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <PreparationCheck
              title="Document review"
              description="10 of 12 reviewed"
              complete
            />

            <PreparationCheck
              title="Preparation checklist"
              description="8 of 10 completed"
              complete
            />

            <PreparationCheck
              title="Reconciliation"
              description="Checks completed"
              complete
            />

            <PreparationCheck
              title="Open issues"
              description="2 still unresolved"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatusLine({
  label,
  value,
  complete = false,
}: {
  label: string;
  value: string;
  complete?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={[
            "flex size-5 shrink-0 items-center justify-center rounded-full",
            complete
              ? "bg-success-muted text-success"
              : "bg-warning-muted text-warning",
          ].join(" ")}
        >
          {complete ? (
            <Check
              className="size-3"
              strokeWidth={2.2}
            />
          ) : (
            <CircleAlert
              className="size-3"
              strokeWidth={2}
            />
          )}
        </span>

        <span className="truncate text-sm text-muted-foreground">
          {label}
        </span>
      </div>

      <span className="shrink-0 text-sm font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

function PreparationCheck({
  title,
  description,
  complete = false,
}: {
  title: string;
  description: string;
  complete?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-[#fbfcfd] p-3.5">
      <span
        className={[
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
          complete
            ? "bg-success-muted text-success"
            : "bg-warning-muted text-warning",
        ].join(" ")}
      >
        {complete ? (
          <Check
            className="size-3.5"
            strokeWidth={2.2}
          />
        ) : (
          <CircleAlert
            className="size-3.5"
            strokeWidth={2}
          />
        )}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function ReadinessBenefit({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/[0.09] text-primary">
        <Check
          className="size-3.5"
          strokeWidth={2.2}
        />
      </span>

      <p className="text-sm leading-6 text-foreground/80">
        {children}
      </p>
    </div>
  );
}