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
className="desktop:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[280px] max-w-[86vw] gap-0 p-0"
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