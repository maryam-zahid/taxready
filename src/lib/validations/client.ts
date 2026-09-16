import { z } from "zod";

export const clientTypeValues = [
  "INDIVIDUAL",
  "BUSINESS",
] as const;

export const individualTaxpayerTypeValues = [
  "SALARIED_INDIVIDUAL",
  "FREELANCER_PROFESSIONAL",
  "SOLE_PROPRIETOR",
  "OTHER_INDIVIDUAL",
] as const;

export const businessEntityTypeValues = [
  "PARTNERSHIP_AOP",
  "PRIVATE_LIMITED_COMPANY",
  "PUBLIC_LIMITED_COMPANY",
  "OTHER",
] as const;

export const clientSchema = z
  .object({
    type: z.enum(clientTypeValues),

    firstName: z.string().trim().max(80, "First name is too long"),

    lastName: z.string().trim().max(80, "Last name is too long"),

    businessName: z
      .string()
      .trim()
      .max(150, "Business name is too long"),

    contactPerson: z
      .string()
      .trim()
      .max(100, "Contact person is too long"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .refine(
        (value) => z.email().safeParse(value).success,
        "Enter a valid email address"
      ),

    phone: z
      .string()
      .trim()
      .max(30, "Phone number is too long")
      .refine(
        (value) =>
          value === "" || /^[0-9+\-()\s]+$/.test(value),
        "Enter a valid phone number"
      ),

    ntn: z
      .string()
      .trim()
      .max(30, "NTN is too long"),

    taxpayerType: z
      .enum(individualTaxpayerTypeValues)
      .nullable(),

    entityType: z
      .enum(businessEntityTypeValues)
      .nullable(),

    occupation: z
      .string()
      .trim()
      .max(150, "Occupation is too long"),

    businessActivity: z
      .string()
      .trim()
      .max(200, "Business activity is too long"),

    taxYear: z
      .number()
      .int()
      .min(2000, "Enter a valid tax year")
      .max(2100, "Enter a valid tax year"),

    preparationDeadline: z
      .string()
      .trim(),

    sendPortalInvitation: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "INDIVIDUAL") {
      if (data.firstName.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["firstName"],
          message: "First name is required",
        });
      }

      if (data.lastName.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["lastName"],
          message: "Last name is required",
        });
      }

      if (!data.taxpayerType) {
        ctx.addIssue({
          code: "custom",
          path: ["taxpayerType"],
          message: "Taxpayer type is required",
        });
      }
    }

    if (data.type === "BUSINESS") {
      if (data.businessName.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["businessName"],
          message: "Business name is required",
        });
      }

      if (data.contactPerson.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["contactPerson"],
          message: "Contact person is required",
        });
      }

      if (!data.entityType) {
        ctx.addIssue({
          code: "custom",
          path: ["entityType"],
          message: "Entity type is required",
        });
      }

      if (data.businessActivity.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["businessActivity"],
          message: "Business activity is required",
        });
      }
    }
  });

export type ClientInput = z.infer<typeof clientSchema>;