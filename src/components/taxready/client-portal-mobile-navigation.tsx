"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { ClientPortalSidebar } from "@/components/taxready/client-portal-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type ClientPortalMobileNavigationProps = {
  practiceName?: string;
};

export function ClientPortalMobileNavigation({
  practiceName,
}: ClientPortalMobileNavigationProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-white hover:bg-white/10 hover:text-white desktop:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <Menu
          className="size-5"
          strokeWidth={1.9}
        />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[280px] max-w-[86vw] gap-0 p-0"
      >
        <SheetTitle className="sr-only">
          Client portal navigation
        </SheetTitle>

        <ClientPortalSidebar
          practiceName={practiceName}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}