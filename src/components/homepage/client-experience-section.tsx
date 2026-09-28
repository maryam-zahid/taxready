"use client";

import {
  Check,
  Clock3,
  FileText,
  UploadCloud,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { MotionReveal } from "@/components/homepage/motion-reveal";

const benefits = [
  "Standardize information and document collection",
  "Reduce repeated client follow-ups",
  "Keep submissions connected to each request",
  "Give your team clearer preparation visibility",
];

export function ClientExperienceSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="services"
      className="overflow-hidden border-y border-border bg-white py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 lg:px-8 xl:gap-20">
        {/* LEFT CONTENT */}
        <MotionReveal>
          <div className="max-w-[520px]">
            <h2 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.045em] text-foreground sm:text-[38px] lg:text-[44px]">
              Make client collaboration easier for your practice.
            </h2>

            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Give every client a clear, secure place to respond
              to your requests and submit supporting documents,
              while your team keeps visibility over what is
              outstanding, submitted, and ready for review.
            </p>

            <div className="mt-8 space-y-3.5">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          x: -14,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.5,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-center gap-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/[0.09] text-primary">
                    <Check
                      className="size-3.5"
                      strokeWidth={2.2}
                    />
                  </span>

                  <span className="text-sm font-medium leading-6 text-foreground/80">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </MotionReveal>

        {/* CLIENT PORTAL PREVIEW */}
        <MotionReveal delay={0.1}>
          <PortalPreview />
        </MotionReveal>
      </div>
    </section>
  );
}

function PortalPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              x: 28,
              scale: 0.985,
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -3,
            }
      }
      className="relative mx-auto max-w-[700px]"
    >
      {/* Subtle depth behind portal */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[36px] bg-primary/[0.035] blur-2xl"
      />

      {/* Portal window */}
      <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-[#f7f9fb] shadow-[0_25px_70px_rgba(15,23,42,0.11)]">
        {/* Portal header */}
        <div className="flex min-h-[68px] items-center justify-between bg-primary px-5 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-primary shadow-sm">
              T
            </div>

            <div>
              <p className="text-sm font-semibold leading-none">
                TaxReady
              </p>

              <p className="mt-1.5 text-[11px] text-white/70">
                Client workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/80 sm:block">
              ABC Tax Consultants
            </div>

            <div className="flex size-8 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
              A
            </div>
          </div>
        </div>

        {/* Portal body */}
        <div className="p-4 sm:p-6">
          {/* Client summary */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                Ahmad Trading
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Complete the items requested by ABC Tax Consultants.
              </p>
            </div>

            <span className="w-fit rounded-full bg-primary/[0.08] px-3 py-1.5 text-[11px] font-semibold text-primary">
              2 actions required
            </span>
          </div>

          {/* Status summary */}
          <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
            <PortalStat
              value="2"
              label="Action required"
            />

            <PortalStat
              value="3"
              label="Submitted"
            />

            <PortalStat
              value="5"
              label="Reviewed"
            />
          </div>

          {/* Preparation requests */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 sm:px-5">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Preparation requests
                </p>

                <p className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">
                  Information and documents requested for FY 2025–26
                </p>
              </div>

              <span className="text-[11px] font-semibold text-primary">
                View all
              </span>
            </div>

            <RequestRow
              icon={FileText}
              title="Bank statements"
              detail="FY 2025–26 · Required document"
              status="Due soon"
            />

            <RequestRow
              icon={UploadCloud}
              title="Salary tax certificate"
              detail="FY 2025–26 · Document submitted"
              status="Submitted"
              complete
            />

            <RequestRow
              icon={Clock3}
              title="Wealth information"
              detail="FY 2025–26 · Information required"
              status="Open"
              last
            />
          </div>

          {/* Required action */}
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-primary/10 bg-primary/[0.055] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Bank statements still required
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Upload the requested statements for consultant review.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              Upload document
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PortalStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3.5 sm:px-4">
      <p className="text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
        {value}
      </p>

      <p className="mt-1 text-[11px] leading-4 text-muted-foreground sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function RequestRow({
  icon: Icon,
  title,
  detail,
  status,
  complete = false,
  last = false,
}: {
  icon: typeof FileText;
  title: string;
  detail: string;
  status: string;
  complete?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 px-4 py-3.5 sm:px-5",
        !last ? "border-b border-slate-100" : "",
      ].join(" ")}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.075] text-primary">
        <Icon
          className="size-4"
          strokeWidth={1.8}
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {detail}
        </p>
      </div>

      <span
        className={[
          "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-[11px]",
          complete
            ? "bg-success-muted text-success"
            : "bg-warning-muted text-warning-foreground",
        ].join(" ")}
      >
        {status}
      </span>
    </div>
  );
}