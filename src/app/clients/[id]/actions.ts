"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { generateClientRequirementsForUser } from "@/services/compliance-requirement.service";

export async function generateComplianceChecklistAction(
  clientId: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  await generateClientRequirementsForUser(
    session.user.id,
    clientId
  );

  revalidatePath(`/clients/${clientId}`);

  return {
    success: true,
  };
}