"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SectionHeading } from "@/components/homepage/section-heading";

const steps = [
  {
    number: "01",
    title: "Request",
    description:
      "Send structured information and document requests so clients know exactly what your practice needs.",
    next: "Collect",
  },
  {
    number: "02",
    title: "Collect",
    description:
      "Clients securely provide requested information and upload supporting documents in one place.",
    next: "Review",
  },
  {
    number: "03",
    title: "Review",
    description:
      "Review submissions, extracted information, and validation results before preparation begins.",
    next: "Resolve",
  },
  {
    number: "04",
    title: "Resolve",
    description:
      "Bring missing information and preparation exceptions into focus and resolve what still needs attention.",
    next: "Preparation-ready",
  },
  {
    number: "05",
    title: "Preparation-ready",
    description:
      "Confirm readiness and generate the checklist or preparation package with everything in place.",
    next: null,
  },
];

export function WorkflowSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const cards = gsap.utils.toArray<HTMLElement>(
        ".workflow-card",
      );

      const paths = gsap.utils.toArray<SVGPathElement>(
        ".workflow-path",
      );

      if (reducedMotion) {
        gsap.set(cards, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
        });

        paths.forEach((path) => {
          gsap.set(path, {
            strokeDasharray: "none",
            strokeDashoffset: 0,
          });
        });

        return;
      }

      paths.forEach((path) => {
        const length = path.getTotalLength();

        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });

      gsap.set(cards, {
        opacity: 0,
        y: 24,
        scale: 0.985,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".workflow-desktop",
          start: "top 72%",
          end: "bottom 75%",
          scrub: 0.8,
        },
      });

      cards.forEach((card, index) => {
        timeline.to(card, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
        });

        if (paths[index]) {
          timeline.to(
            paths[index],
            {
              strokeDashoffset: 0,
              duration: 1,
              ease: "none",
            },
            ">-0.1",
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="workflow"
      className="overflow-hidden bg-white py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-[760px] text-center">
          <SectionHeading
            centered
            title="From client request to preparation-ready."
            description="A connected workflow keeps every request, submission, review, and exception visible until the client file is ready for preparation."
          />
        </div>

        {/* =========================
            DESKTOP / TABLET
        ========================== */}
        <div className="workflow-desktop relative mx-auto mt-14 hidden max-w-[1040px] md:block lg:mt-16">
          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.number}>
                {/* Card row */}
                <div
                  className={
                    isLeft
                      ? "flex justify-start"
                      : "flex justify-end"
                  }
                >
                  <article
                    className={[
                      "workflow-card group relative z-10",
                      "w-[46%] max-w-[470px]",
                      "overflow-hidden rounded-[22px]",
                      "border border-white/20",
                      "bg-gradient-to-br",
                      "from-[#1269e8]",
                      "via-[#1678f2]",
                      "to-[#2495ff]",
                      "px-6 py-6",
                      "text-white",
                      "opacity-0",
                      "shadow-[0_18px_45px_rgba(47,128,237,0.20)]",
                      "transition-[transform,box-shadow] duration-300 ease-out",
                      "hover:-translate-y-1",
                      "hover:scale-[1.012]",
                      "hover:shadow-[0_24px_60px_rgba(47,128,237,0.28)]",
                      "lg:px-7 lg:py-7",
                    ].join(" ")}
                  >
                    {/* Decorative background curves */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border border-white/10"
                    />

                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-36 right-6 size-72 rounded-full border border-white/10"
                    />

                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-[#0755c7]/20"
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Number */}
                      <span className="inline-flex h-10 min-w-12 items-center justify-center rounded-xl bg-white/85 px-3 text-sm font-bold text-primary shadow-sm backdrop-blur-sm">
                        {step.number}
                      </span>

                      {/* Title */}
                      <h3 className="mt-6 text-[23px] font-semibold tracking-[-0.035em] text-white lg:text-[25px]">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-3 max-w-[370px] text-[14px] leading-6 text-white/80">
                        {step.description}
                      </p>

                      {/* Bottom pill */}
                      <div className="mt-6">
                        <span className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-xs font-semibold text-primary shadow-sm">
                          {step.next
                            ? `Next: ${step.next}  →`
                            : "Ready for preparation  →"}
                        </span>
                      </div>
                    </div>
                  </article>
                </div>

                {/* Connector */}
                {!isLast && (
                  <div className="relative h-[105px]">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 1040 105"
                      preserveAspectRatio="none"
                      className="absolute inset-0 size-full overflow-visible"
                    >
                      {isLeft ? (
                        <path
                          className="workflow-path"
                          d="
                            M 455 0
                            C 590 0, 650 20, 690 52
                            C 725 80, 735 105, 735 105
                          "
                          fill="none"
                          stroke="#2f80ed"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      ) : (
                        <path
                          className="workflow-path"
                          d="
                            M 585 0
                            C 450 0, 390 20, 350 52
                            C 315 80, 305 105, 305 105
                          "
                          fill="none"
                          stroke="#2f80ed"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* =========================
            MOBILE
        ========================== */}
        <div className="mt-12 space-y-4 md:hidden">
          {steps.map((step, index) => (
            <article
              key={step.number}
              className={[
                "relative overflow-hidden rounded-[20px]",
                "border border-white/20",
                "bg-gradient-to-br",
                "from-[#1269e8]",
                "via-[#1678f2]",
                "to-[#2495ff]",
                "p-5 text-white",
                "shadow-[0_14px_36px_rgba(47,128,237,0.18)]",
              ].join(" ")}
            >
              {/* Background detail */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 size-60 rounded-full border border-white/10"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-[#0755c7]/20"
              />

              <div className="relative z-10">
                <span className="inline-flex h-9 min-w-11 items-center justify-center rounded-xl bg-white/85 px-3 text-xs font-bold text-primary">
                  {step.number}
                </span>

                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-white">
                  {step.title}
                </h3>

                <p className="mt-2.5 text-sm leading-6 text-white/80">
                  {step.description}
                </p>

                <span className="mt-5 inline-flex min-h-9 items-center rounded-full bg-white px-4 text-xs font-semibold text-primary">
                  {step.next
                    ? `Next: ${step.next}  →`
                    : "Ready for preparation  →"}
                </span>
              </div>

              {/* Mobile connector */}
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute -bottom-5 left-1/2 h-5 w-px bg-primary"
                />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}