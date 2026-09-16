import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getAdminProfile } from "@/services/auth-profile.service";
import { getOrganizationForUser } from "@/services/organization.service";
import { ClientForm } from "./client-form";

export default async function NewClientPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profile, organization] =
    await Promise.all([
      getAdminProfile(session.user.id),
      getOrganizationForUser(session.user.id),
    ]);

  if (!profile) {
    redirect("/onboarding/profile");
  }

  if (!organization) {
    redirect("/onboarding/firm");
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-semibold">
        Add Client
      </h1>

      <p className="mt-2 mb-8 text-sm text-gray-600">
        Add the basic tax profile information for
        this client.
      </p>

      <ClientForm />
    </main>
  );
}