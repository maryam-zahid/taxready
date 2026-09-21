import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-xs outline-none",
        "placeholder:text-muted-foreground/80",
        "transition-[border-color,box-shadow,background-color] duration-150",
        "hover:border-foreground/25",
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/10",
        "disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/10",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };