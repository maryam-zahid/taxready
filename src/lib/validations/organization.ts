import { z } from "zod";

export const practiceTypeValues = [
  "INDEPENDENT_TAX_PROFESSIONAL",
  "TAX_ACCOUNTING_FIRM",
  "OTHER",
] as const;

export const organizationSchema = z
  .object({
    practiceType: z.enum(practiceTypeValues),

    name: z
      .string()
      .trim()
      .max(150, "Name is too long"),

    businessEmail: z
      .string()
      .trim()
      .max(150, "Email is too long")
      .refine(
        (value) => value === "" || z.email().safeParse(value).success,
        "Enter a valid business email"
      ),

    businessPhone: z
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

    country: z
      .string()
      .trim()
      .min(2, "Country is required")
      .max(100, "Country is too long"),

    city: z
      .string()
      .trim()
      .max(100, "City is too long"),

    address: z
      .string()
      .trim()
      .max(250, "Address is too long"),

    website: z
      .string()
      .trim()
      .max(200, "Website is too long")
      .refine(
        (value) =>
          value === "" || /^https?:\/\/.+/i.test(value),
        "Website must start with http:// or https://"
      ),
  })
  .superRefine((data, ctx) => {
    if (
      data.practiceType === "TAX_ACCOUNTING_FIRM" ||
      data.practiceType === "OTHER"
    ) {
      if (data.name.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message:
            data.practiceType === "TAX_ACCOUNTING_FIRM"
              ? "Firm name is required"
              : "Practice or workspace name is required",
        });
      }
    }

    if (data.practiceType === "TAX_ACCOUNTING_FIRM") {
      if (!data.businessEmail) {
        ctx.addIssue({
          code: "custom",
          path: ["businessEmail"],
          message: "Business email is required",
        });
      }

      if (!data.businessPhone) {
        ctx.addIssue({
          code: "custom",
          path: ["businessPhone"],
          message: "Business phone is required",
        });
      }
    }
  });

export type OrganizationInput = z.infer<
  typeof organizationSchema
>;