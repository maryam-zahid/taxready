import Link from "next/link";
import { FileCheck2 } from "lucide-react";

type TaxReadyLogoProps = {
  href?: string;
  light?: boolean;
  compact?: boolean;
};

export function TaxReadyLogo({
  href = "/dashboard",
  light = false,
  compact = false,
}: TaxReadyLogoProps) {
  return (
    <Link
      href={href}
      className="group inline-flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      aria-label="TaxReady"
    >
      <span
        className={[
          "flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-transform group-hover:-translate-y-0.5",
          light
            ? "border-white/80 bg-white text-primary"
            : "border-primary/10 bg-primary text-primary-foreground",
        ].join(" ")}
      >
        <FileCheck2
          className="size-[21px]"
          strokeWidth={2}
        />
      </span>

      {!compact && (
        <span
          className={[
            "text-[19px] font-bold tracking-[-0.04em]",
            light ? "text-white" : "text-foreground",
          ].join(" ")}
        >
          TaxReady
        </span>
      )}
    </Link>
  );
}