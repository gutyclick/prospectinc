import { z } from "zod";

export const proposalTemplateSchema = z.enum([
  "web-basica",
  "landing-whatsapp",
  "web-corporativa",
  "reservas-online",
]);

export const proposalFormSchema = z.object({
  prospectId: z.string().min(1, "Selecciona un prospecto."),
  template: proposalTemplateSchema,
  service: z.string().trim().min(2, "Escribe el servicio."),
  price: z.coerce
    .number<number>()
    .positive("El precio debe ser mayor que cero."),
  currency: z.literal("USD"),
  deliveryTime: z.string().trim().min(2, "Indica el plazo estimado."),
  summary: z.string().trim().min(10, "Añade un resumen más descriptivo."),
  includedItems: z
    .string()
    .trim()
    .min(2, "Añade al menos un elemento incluido."),
  callToAction: z.string().trim().min(5, "Añade un llamado a la acción."),
});

export type ProposalFormInput = z.input<typeof proposalFormSchema>;
export type ProposalFormValues = z.output<typeof proposalFormSchema>;
export type ProposalTemplate = z.infer<typeof proposalTemplateSchema>;
