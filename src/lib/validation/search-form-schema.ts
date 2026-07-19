import { z } from "zod";

import { searchSourceSchema } from "./domain-schemas";

export const preferredChannelSchema = z.enum([
  "web-whatsapp",
  "correo",
  "telefono",
]);

export const opportunityLevelSchema = z.enum([
  "todos",
  "sin-web",
  "web-antigua",
  "sin-reservas",
]);

export const searchFormSchema = z.object({
  query: z.string().trim().min(2, "Escribe un nicho o tipo de negocio."),
  location: z.string().trim().min(2, "Escribe una ubicación."),
  resultLimit: z.coerce
    .number<number>({ error: "Indica una cantidad válida." })
    .int("La cantidad debe ser un número entero.")
    .min(1, "Solicita al menos un resultado.")
    .max(100, "El prototipo admite hasta 100 resultados."),
  preferredChannel: preferredChannelSchema,
  opportunityLevel: opportunityLevelSchema,
  sources: z
    .array(searchSourceSchema)
    .min(1, "Selecciona al menos una fuente."),
});

export type SearchFormValues = z.infer<typeof searchFormSchema>;
