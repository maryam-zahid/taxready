import { z } from "zod";

export const createClientRequestSchema = z.object({
  clientRequirementId: z.string().min(1, "Requirement is required"),

  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(200, "Subject is too long"),

  message: z
    .string()
    .trim()
    .max(2000, "Message is too long")
    .optional()
    .or(z.literal("")),

  dueAt: z.coerce.date().optional(),
});

export type CreateClientRequestInput = z.infer<
  typeof createClientRequestSchema
>;