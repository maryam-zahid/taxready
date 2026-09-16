import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getAdminProfile } from "@/services/auth-profile.service";

import { ProfileForm } from "./profile-form";

export default async function ProfileOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const profile = await getAdminProfile(session.user.id);

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10">
          <p className="text-lg font-semibold text-black">
            TaxReady
          </p>
        </div>

        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">
              Step 2 of 4
            </p>

            <p className="text-sm text-gray-500">
              Your Profile
            </p>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/2 rounded-full bg-black" />
          </div>
        </div>

        <section>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Tell us about yourself
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
            Add your professional details so your TaxReady workspace
            can be personalized for you and your practice.
          </p>

       <ProfileForm
  email={session.user.email}
  initialValues={{
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    phone: profile?.phone ?? "",
  }}
/>
        </section>
      </div>
    </main>
  );
}