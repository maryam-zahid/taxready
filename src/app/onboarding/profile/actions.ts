"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { authProfileSchema } from "@/lib/validations/auth-profile";
import { saveAdminProfile } from "@/services/auth-profile.service";

export type ProfileActionInput = {
  firstName: string;
  lastName: string;
  phone: string;
};

export async function saveProfileAction(input: ProfileActionInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be signed in to complete your profile.",
    };
  }

  const result = authProfileSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid profile information.",
    };
  }

  try {
    await saveAdminProfile(session.user.id, result.data);

    return {
      success: true,
      message: "Profile saved successfully.",
    };
  } catch (error) {
    console.error("Failed to save admin profile:", error);

    return {
      success: false,
      message: "Unable to save your profile. Please try again.",
    };
  }
}