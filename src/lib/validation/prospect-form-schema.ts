import { z } from "zod";

import { websiteStatusSchema } from "./domain-schemas";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value));
const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.url().safeParse(value).success,
    "Escribe una URL válida.",
  )
  .transform((value) => (value === "" ? null : value));
const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Escribe un correo válido.",
  )
  .transform((value) => (value === "" ? null : value));

export const prospectFormSchema = z
  .object({
    businessName: z.string().trim().min(2, "Escribe el nombre del negocio."),
    niche: z.string().trim().min(2, "Escribe el nicho."),
    location: z.string().trim().min(2, "Escribe la ubicación."),
    websiteUrl: optionalUrl,
    websiteStatus: websiteStatusSchema,
    publicEmail: optionalEmail,
    publicPhone: optionalText,
    publicWhatsapp: optionalText,
    contactSourceUrl: optionalUrl,
    opportunityScore: z.coerce.number<number>().int().min(0).max(100),
  })
  .superRefine((values, context) => {
    if (
      (values.publicEmail || values.publicPhone || values.publicWhatsapp) &&
      !values.contactSourceUrl
    ) {
      context.addIssue({
        code: "custom",
        path: ["contactSourceUrl"],
        message: "Añade la URL de origen del contacto público.",
      });
    }
    if (values.websiteStatus === "sin-sitio" && values.websiteUrl) {
      context.addIssue({
        code: "custom",
        path: ["websiteUrl"],
        message: "Un negocio sin web no debe incluir URL de sitio.",
      });
    }
  });

export type ProspectFormInput = z.input<typeof prospectFormSchema>;
export type ProspectFormValues = z.output<typeof prospectFormSchema>;
