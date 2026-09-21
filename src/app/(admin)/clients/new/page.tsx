import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/taxready/page-header";
import { Button } from "@/components/ui/button";

import { ClientForm } from "./client-form";

export default function NewClientPage() {
  return (
    <div className="app-page">
      <div className="mb-5">
        <Button
  nativeButton={false}
  variant="ghost"
  size="sm"
  render={<Link href="/clients" />}
  className="-ml-2 text-muted-foreground"
>
          <ArrowLeft className="size-4" />
          Back to clients
        </Button>
      </div>

      <PageHeader
        title="Add client"
        description="Create a client record for your practice. You can complete their detailed tax profile after the client is created."
      />

      <div className="mt-6 max-w-5xl">
        <ClientForm />
      </div>
    </div>
  );
}