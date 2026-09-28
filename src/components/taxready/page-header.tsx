import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="text-[27px] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground tablet:text-[30px]">
          {title}
        </h1>

        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex w-full shrink-0 flex-col gap-2 min-[480px]:w-auto min-[480px]:flex-row min-[480px]:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}