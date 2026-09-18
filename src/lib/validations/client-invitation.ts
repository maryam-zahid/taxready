import { z } from "zod";

export const createClientInvitationSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
});

export type CreateClientInvitationInput = z.infer<
  typeof createClientInvitationSchema
>;