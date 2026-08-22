import { z } from "zod";

export const whatsappAgentInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, "Telefon E.164 biçiminde olmalıdır."),
  messageTemplate: z.string().trim().min(2).max(500),
  enabled: z.boolean(),
  position: z.number().int().min(0).max(1000),
});

export type WhatsAppAgentInput = z.infer<typeof whatsappAgentInputSchema>;
