"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { markClientTaxReadyAction } from "./readiness-actions";

type Props = {
  clientId: string;
};

export function MarkTaxReadyButton({
  clientId,
}: Props) {
  const [pending, setPending] =
    useState(false);

  async function handleClick() {
    try {
      setPending(true);

      await markClientTaxReadyAction(
        clientId,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={handleClick}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CheckCircle2 className="size-4" />
      )}

      {pending
        ? "Marking..."
        : "Mark Tax Ready"}
    </Button>
  );
}