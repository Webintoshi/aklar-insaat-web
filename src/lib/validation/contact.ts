import { z } from "zod";

export const contactRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((value) => value === "" || /^[+\d][\d\s()-]+$/.test(value), {
      message: "Telefon numarası geçersiz.",
    })
    .optional()
    .default(""),
  subject: z.string().trim().max(180).optional().default(""),
  message: z.string().trim().min(10).max(5_000),
  company: z.string().max(0).optional().default(""),
});
