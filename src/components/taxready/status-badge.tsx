import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
};

const toneStyles: Record<StatusTone, string> = {
  neutral:
    "border-border bg-muted text-muted-foreground",
  info:
    "border-primary/15 bg-info-muted text-info-foreground",
  success:
    "border-success/15 bg-success-muted text-success-foreground",
  warning:
    "border-warning/15 bg-warning-muted text-warning-foreground",
  danger:
    "border-destructive/15 bg-destructive/10 text-destructive",
};

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "min-h-6 rounded-md px-2 py-0.5 text-[11px] font-semibold leading-4 shadow-none",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </Badge>
  );
}