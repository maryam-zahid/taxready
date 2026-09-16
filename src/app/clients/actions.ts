"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { clientSchema } from "@/lib/validations/client";
import { createClientForUser } from "@/services/client.service";

export type ClientActionInput = {
  type: "INDIVIDUAL" | "BUSINESS";
  firstName: string;
  lastName: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  ntn: string;
  taxpayerType:
    | "SALARIED_INDIVIDUAL"
    | "FREELANCER_PROFESSIONAL"
    | "SOLE_PROPRIETOR"
    | "OTHER_INDIVIDUAL"
    | null;
  entityType:
    | "PARTNERSHIP_AOP"
    | "PRIVATE_LIMITED_COMPANY"
    | "PUBLIC_LIMITED_COMPANY"
    | "OTHER"
    | null;
  occupation: string;
  businessActivity: string;
  taxYear: number;
  preparationDeadline: string;
  sendPortalInvitation: boolean;
};

export async function createClientAction(
  input: ClientActionInput
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be signed in to create a client.",
    };
  }

  const result = clientSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Please check the client information.",
    };
  }

  try {
    const client = await createClientForUser(
      session.user.id,
      result.data
    );

    return {
      success: true,
      message: "Client created successfully.",
      clientId: client.id,
    };
 } catch (error) {
  console.error("Failed to create client:", error);

  if (
    error instanceof Error &&
    error.message === "CLIENT_EMAIL_EXISTS"
  ) {
    return {
      success: false,
      message:
        "A client with this email already exists in your practice.",
    };
  }

  if (
    error instanceof Error &&
    error.message ===
      "ORGANIZATION_NOT_FOUND"
  ) {
    return {
      success: false,
      message:
        "Your practice setup could not be found.",
    };
  }

  if (
    error instanceof Error &&
    error.message ===
      "INVALID_PREPARATION_DEADLINE"
  ) {
    return {
      success: false,
      message:
        "Enter a valid preparation deadline.",
    };
  }

  return {
    success: false,
    message:
      "Unable to create client. Please try again.",
  };
}
}