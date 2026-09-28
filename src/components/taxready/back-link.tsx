import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type BackLinkProps = {
  href: string;
  children: string;
  className?: string;
};

export function BackLink({
  href,
  children,
  className,
}: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-8 w-fit items-center gap-1.5 rounded-md px-1 text-sm font-medium text-muted-foreground",
        "transition-colors hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
        className,
      )}
    >
      <ArrowLeft
        aria-hidden="true"
        className="size-4"
        strokeWidth={1.8}
      />
      <span>{children}</span>
    </Link>
  );
}