"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
<section
  className="
    relative isolate overflow-hidden bg-slate-950
    min-h-[680px]
    sm:min-h-[620px]
    tablet:min-h-[640px]
    desktop:min-h-[760px]
  "
>
        <motion.div
  aria-hidden="true"
  initial={
    reduceMotion
      ? false
      : {
          opacity: 0,
          scale: 1.025,
        }
  }
  animate={{
    opacity: 1,
    scale: 1,
  }}
  transition={{
    duration: 1,
    ease,
  }}
  className="
    absolute inset-0
    bg-[url('/images/taxready-hero-office.png')]
    bg-cover
    bg-[position:62%_center]
    sm:bg-[position:58%_center]
    tablet:bg-[position:55%_center]
    desktop:bg-center
  "
/>
      {/* =====================================================
          CONTRAST
          Darkens photograph, never whitens it.
      ====================================================== */}
     <div
  aria-hidden="true"
  className="
    pointer-events-none absolute inset-0
    bg-gradient-to-r
    from-slate-950/55
    via-slate-950/20
    to-slate-950/5

    sm:from-slate-950/50
    sm:via-slate-950/15

    desktop:from-slate-950/55
    desktop:via-slate-950/15
    desktop:to-transparent
  "
/>

      {/* =====================================================
          CONTENT
      ====================================================== */}
     <div
  className="
    relative z-10 mx-auto flex
    min-h-[680px]
    w-full max-w-[1440px]
    items-center
    px-4 pb-10 pt-24

    sm:min-h-[620px]
    sm:px-6
    sm:pb-12
    sm:pt-24

    tablet:min-h-[640px]

    desktop:min-h-[760px]
    desktop:px-8
    desktop:pb-20
    desktop:pt-28
  "
>
        <div
          className="
            w-full
            max-w-[650px]

            sm:max-w-[610px]

            desktop:max-w-[660px]
          "
        >
          {/* Heading */}
          <motion.h1
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 26,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.08,
              ease,
            }}
            className="
              text-[36px]
              font-semibold
              leading-[1.05]
              tracking-[-0.045em]
              text-white

              drop-shadow-[0_2px_14px_rgba(15,23,42,0.4)]

              sm:text-[44px]

              tablet:text-[48px]

              desktop:text-[58px]
            "
          >
            From client requests to preparation-ready, start
            with everything in place.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 18,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease,
            }}
            className="
              mt-5 max-w-[600px]
              text-[15px]
              leading-7
              text-white/90
              drop-shadow-sm

              sm:text-base

              desktop:mt-6
              desktop:text-lg
              desktop:leading-8
            "
          >
            Keep client information, document requests,
            submissions, reminders, and readiness status
            organized in one clear workspace.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 16,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.32,
              ease,
            }}
            className="
              mt-7 flex
              flex-col gap-3

              sm:mt-8
              sm:flex-row
            "
          >
            <Button
              nativeButton={false}
              size="lg"
              className="
                h-12 w-full
                border border-primary
                bg-primary
                px-6
                font-semibold
                text-primary-foreground
                shadow-lg shadow-primary/15

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
                border-white/70
                bg-transparent
                px-6
                font-semibold
                text-white
                shadow-none
                backdrop-blur-[2px]

                hover:border-white
                hover:bg-white/10
                hover:text-white

                sm:w-auto
              "
              render={<Link href="/#workflow" />}
            >
              <span
                className="
                  flex size-6
                  items-center justify-center
                  rounded-full
                  bg-white
                  text-primary
                "
              >
                <Play
                  className="ml-px size-3"
                  fill="currentColor"
                />
              </span>

              See how it works
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}