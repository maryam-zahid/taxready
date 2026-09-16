import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getAdminProfile } from "@/services/auth-profile.service";
import { getOrganizationForUser } from "@/services/organization.service";
import { FirmForm } from "./firm-form";

export default async function FirmSetupPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await getAdminProfile(
    session.user.id
  );

  if (!profile) {
    redirect("/onboarding/profile");
  }

  const organization =
    await getOrganizationForUser(
      session.user.id
    );

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-semibold">
        Set up your practice
      </h1>

      <p className="mt-2 mb-8 text-sm text-gray-600">
        Tell us how you work and add your practice
        details.
      </p>

      <FirmForm
        initialValues={{
          practiceType:
            organization?.practiceType ??
            "INDEPENDENT_TAX_PROFESSIONAL",

          name: organization?.name ?? "",

          businessEmail:
            organization?.businessEmail ?? "",

          businessPhone:
            organization?.businessPhone ?? "",

          ntn: organization?.ntn ?? "",

          country:
            organization?.country ?? "Pakistan",

          city: organization?.city ?? "",

          address: organization?.address ?? "",

          website: organization?.website ?? "",
        }}
      />
    </main>
  );
}