import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getAdminProfile } from "@/services/auth-profile.service";
import { getOrganizationForUser } from "@/services/organization.service";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profile, organization] = await Promise.all([
    getAdminProfile(session.user.id),
    getOrganizationForUser(session.user.id),
  ]);

  if (!profile) {
    redirect("/onboarding/profile");
  }

  if (!organization) {
    redirect("/onboarding/firm");
  }

  const practiceTypeLabels = {
    INDEPENDENT_TAX_PROFESSIONAL:
      "Independent Tax Professional",
    TAX_ACCOUNTING_FIRM:
      "Tax / Accounting Firm",
    OTHER: "Other",
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">
        Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Welcome, {profile.firstName}.
      </p>

      <div className="mt-8 rounded-lg border p-5">
        <h2 className="text-lg font-medium">
          Practice
        </h2>

        <div className="mt-4 space-y-2 text-sm">
          <p>
            <strong>Name:</strong>{" "}
            {organization.name}
          </p>

          <p>
            <strong>Type:</strong>{" "}
            {
              practiceTypeLabels[
                organization.practiceType
              ]
            }
          </p>

          <p>
            <strong>Country:</strong>{" "}
            {organization.country}
          </p>

          {organization.city && (
            <p>
              <strong>City:</strong>{" "}
              {organization.city}
            </p>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Admin dashboard features will be added next.
      </p>
    </main>
  );
}