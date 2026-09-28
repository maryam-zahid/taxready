"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { AdminSidebar } from "@/components/taxready/admin-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-lg text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/40 desktop:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <Menu className="size-5" strokeWidth={2} />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[280px] max-w-[86vw] gap-0 border-r p-0"
      >
        <SheetTitle className="sr-only">
          TaxReady navigation
        </SheetTitle>

        <AdminSidebar
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}