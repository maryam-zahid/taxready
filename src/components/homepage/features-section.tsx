"use client";

import { motion, useReducedMotion } from "motion/react";

import { MotionReveal } from "@/components/homepage/motion-reveal";
import { SectionHeading } from "@/components/homepage/section-heading";

const features = [
  {
    number: "01",
    label: "Onboarding",
    title: "Structured client profiles",
    description:
      "Keep individual and business client information organized from the beginning in one consistent preparation record.",
  },
  {
    number: "02",
    label: "Collection",
    title: "Document requests & uploads",
    description:
      "Send clear information requests and let clients securely provide responses and supporting documents through their portal.",
  },
  {
    number: "03",
    label: "Follow-up",
    title: "Automated reminders",
    description:
      "Keep outstanding requests moving with scheduled email reminders instead of relying on repeated manual follow-ups.",
  },
  {
    number: "04",
    label: "Review",
    title: "Extraction & validation",
    description:
      "Review client submissions, extracted information, and validation outcomes before documents are approved for preparation.",
  },
  {
    number: "05",
    label: "Checks",
    title: "Preparation reconciliation",
    description:
      "Bring supported preparation checks and wealth movement reconciliation into the same structured workflow.",
  },
  {
    number: "06",
    label: "Resolution",
    title: "Exception management",
    description:
      "Keep unresolved issues visible and connected to the client until the information required for preparation is complete.",
  },
];

export function FeaturesSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#f7f9fb] py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <MotionReveal>
          <div className="mx-auto max-w-[760px] text-center">
            <SectionHeading
              centered
              title="Everything your practice needs before preparation begins."
              description="Bring client information, document collection, follow-ups, review work, and preparation checks into one structured workflow."
            />
          </div>
        </MotionReveal>

     <div className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-16 lg:gap-5">
  {features.map((feature, index) => (
    <motion.article
      key={feature.title}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 20,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.55,
        delay: reduceMotion ? 0 : (index % 2) * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -4,
              scale: 1.008,
            }
      }
      className="
        group relative min-h-[205px] overflow-hidden
        rounded-[22px]
        border border-slate-200/90
        bg-white
        p-6 sm:p-7
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        transition-[border-color,box-shadow]
        duration-300
        hover:border-primary/25
        hover:shadow-[0_20px_50px_rgba(15,23,42,0.09)]
      "
    >
     

     

      <div className="relative z-10">
        {/* number + category */}
        <div className="flex items-center gap-3">
          <span
            className="
              inline-flex h-10 min-w-12 items-center justify-center
              rounded-xl
              bg-primary
              px-3
              text-xs font-bold tracking-[0.06em]
              text-white
              shadow-[0_7px_18px_rgba(47,128,237,0.20)]
              transition-transform duration-300
              group-hover:scale-105
            "
          >
            {feature.number}
          </span>

          <span className="text-[11px] font-semibold uppercase tracking-[0.13em] text-primary">
            {feature.label}
          </span>
        </div>

        {/* content */}
        <h3 className="mt-6 text-xl font-semibold tracking-[-0.025em] text-foreground sm:text-[21px]">
          {feature.title}
        </h3>

        <p className="mt-3 max-w-[520px] text-sm leading-6 text-muted-foreground">
          {feature.description}
        </p>

        {/* bottom accent */}
        <div className="mt-6 flex items-center gap-2">
          <span
            className="
              h-[3px] w-8 rounded-full bg-primary
              transition-all duration-300
              group-hover:w-14
            "
          />

          <span className="h-[3px] w-2 rounded-full bg-primary/20" />
        </div>
      </div>
    </motion.article>
  ))}
</div>
      </div>
    </section>
  );
}