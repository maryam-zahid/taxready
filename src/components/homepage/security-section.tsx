"use client";

import Link from "next/link";
import {
  FileLock2,
  History,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { MotionReveal } from "@/components/homepage/motion-reveal";
import { Button } from "@/components/ui/button";

const securityItems = [
  {
    icon: KeyRound,
    title: "Authenticated access",
    description:
      "Practice and client workflows stay behind authenticated access.",
  },
  {
    icon: FileLock2,
    title: "Protected documents",
    description:
      "Client document access follows application and ownership checks.",
  },
  {
    icon: History,
    title: "Audit activity",
    description:
      "Important preparation actions remain visible and traceable.",
  },
];

export function SecuritySection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="security"
      className="overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        {/* SECURITY */}
        <MotionReveal>
          <div className="mx-auto max-w-[760px] text-center">
            <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.045em] text-foreground sm:text-[38px] lg:text-[42px]">
              Client information stays inside a controlled workflow.
            </h2>

            <p className="mx-auto mt-4 max-w-[670px] text-base leading-7 text-muted-foreground">
              TaxReady keeps practice workflows behind authenticated
              access, protects client document access, and records
              important preparation activity for better visibility.
            </p>
          </div>
        </MotionReveal>

        <div className="mx-auto mt-9 grid max-w-[1000px] gap-3 md:grid-cols-3">
          {securityItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <MotionReveal
                key={item.title}
                delay={index * 0.06}
              >
                <motion.div
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -3,
                        }
                  }
                  transition={{ duration: 0.25 }}
                  className="h-full rounded-2xl border border-slate-200 bg-[#fbfcfd] p-5"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                      <Icon
                        className="size-[17px]"
                        strokeWidth={1.9}
                      />
                    </span>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </MotionReveal>
            );
          })}
        </div>

        {/* FINAL CTA */}
        <MotionReveal delay={0.08}>
          <div
            className="
              relative mt-14 overflow-hidden
              rounded-[26px]
              shadow-[0_24px_70px_rgba(47,128,237,0.16)]
              sm:mt-16
            "
          >
            {/* APPROVED BLUE → SOFT BLUE → YELLOW GRADIENT */}
           <div
  aria-hidden="true"
  className="
    pointer-events-none absolute inset-0
    bg-[linear-gradient(110deg,#2f6df6_0%,#315ff0_28%,#416fe5_43%,#8f91ad_57%,#d3b65f_70%,#f4d45d_82%,#ffdf63_100%)]
  "
/>

            {/* Subtle lighting */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute inset-0
                bg-[radial-gradient(circle_at_18%_75%,rgba(255,255,255,0.16),transparent_32%)]
              "
            />

            <div className="relative px-5 py-10 sm:px-8 sm:py-11 lg:px-12 lg:py-12">
              {/* CTA COPY */}
              <div className="mx-auto max-w-[780px] text-center text-white">
                <h2 className="text-[28px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[36px] lg:text-[42px]">
                  Bring every client file closer to
                  <br className="hidden sm:block" /> preparation-ready.
                </h2>

                <p className="mx-auto mt-4 max-w-[720px] text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
                  Give your tax practice one structured workflow for
                  client requests, document collection, review,
                  preparation checks, and readiness.
                </p>
              </div>

              {/* WHITE CTA PANEL */}
              <div
                className="
                  mx-auto mt-7 max-w-[900px]
                  rounded-[18px]
                  bg-white
                  p-2.5
                  shadow-[0_14px_40px_rgba(15,23,42,0.12)]
                  sm:p-3
                "
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-h-[54px] flex-1 items-center px-3 sm:px-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground sm:text-[15px]">
                        Ready to organize your preparation workflow?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                        Create your practice account and start with your
                        first client.
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <Button
                      nativeButton={false}
                      size="lg"
                      className="
                        h-12 w-full
                        bg-primary px-6
                        font-semibold text-white
                        shadow-sm
                        hover:bg-primary/90
                        sm:w-auto
                      "
                      render={<Link href="/register" />}
                    >
                      Get started
                      <ArrowRight className="size-4" />
                    </Button>

                    <Button
                      nativeButton={false}
                      size="lg"
                      variant="outline"
                      className="
                        h-12 w-full
                        border-slate-200 bg-white px-6
                        font-semibold text-foreground
                        hover:bg-slate-50
                        sm:w-auto
                      "
                      render={<Link href="/login" />}
                    >
                      Sign in
                    </Button>
                  </div>
                </div>
              </div>

              {/* PRODUCT POSITIONING */}
              <p className="mx-auto mt-5 max-w-[760px] text-center text-[11px] leading-5 text-white/75 sm:text-xs">
                TaxReady supports pre-filing preparation and readiness.
                Final tax return filing continues through the applicable
                FBR filing process.
              </p>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}