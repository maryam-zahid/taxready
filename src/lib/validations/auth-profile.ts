import { z } from "zod";

export const authProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),

  phone: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .max(30, "Mobile number is too long")
    .refine(
      (value) => /^[0-9+\-()\s]+$/.test(value),
      "Enter a valid mobile number"
    ),
});

export type AuthProfileInput = z.infer<typeof authProfileSchema>;