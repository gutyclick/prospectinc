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
  country: z.string().trim().max(80).optional(),
  resultLimit: z.coerce
    .number<number>({ error: "Indica una cantidad válida." })
    .int("La cantidad debe ser un número entero.")
    .min(1, "Solicita al menos un resultado.")
    .max(20, "Google Places admite hasta 20 resultados por búsqueda."),
  preferredChannel: preferredChannelSchema,
  opportunityLevel: opportunityLevelSchema,
  sources: z
    .array(searchSourceSchema)
    .refine(
      (sources) => sources.length === 1 && sources[0] === "google-places",
      "Esta fase utiliza exclusivamente Google Places.",
    ),
});

export type SearchFormValues = z.infer<typeof searchFormSchema>;
