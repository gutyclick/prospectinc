import { z } from "zod";

const entityIdSchema = z.string().min(1);
const isoDateSchema = z.iso.datetime({ offset: true });
const optionalUrlSchema = z.url().nullable();
const optionalContactSchema = z.string().min(1).nullable();

export const websiteStatusSchema = z.enum([
  "sin-sitio",
  "desactualizado",
  "solo-redes",
  "basico",
  "optimizado",
]);

export const commercialStatusSchema = z.enum([
  "nuevo",
  "analizando",
  "calificado",
  "alta-prioridad",
  "propuesta-lista",
  "contactado",
  "respondio",
  "seguimiento",
  "negociacion",
  "ganado",
  "descartado",
]);

export const prospectSchema = z
  .object({
    id: entityIdSchema,
    searchId: entityIdSchema.nullable().optional(),
    businessName: z.string().min(2),
    niche: z.string().min(2),
    location: z.string().min(2),
    websiteUrl: optionalUrlSchema,
    websiteStatus: websiteStatusSchema,
    publicEmail: z.email().nullable(),
    publicPhone: optionalContactSchema,
    publicWhatsapp: optionalContactSchema,
    contactSourceUrl: optionalUrlSchema,
    opportunityScore: z.number().int().min(0).max(100),
    commercialStatus: commercialStatusSchema,
    recommendedOffer: z.string().min(2),
    aiSummary: z.string().min(2),
    detectedOpportunities: z.array(z.string().min(2)).min(1),
    createdAt: isoDateSchema,
    updatedAt: isoDateSchema,
  })
  .superRefine((prospect, context) => {
    const hasPublicContact = Boolean(
      prospect.publicEmail || prospect.publicPhone || prospect.publicWhatsapp,
    );

    if (hasPublicContact && !prospect.contactSourceUrl) {
      context.addIssue({
        code: "custom",
        path: ["contactSourceUrl"],
        message: "Todo contacto público debe conservar su URL de origen.",
      });
    }

    if (prospect.websiteStatus === "sin-sitio" && prospect.websiteUrl) {
      context.addIssue({
        code: "custom",
        path: ["websiteUrl"],
        message: "Un prospecto sin sitio no puede tener websiteUrl.",
      });
    }

    if (prospect.updatedAt < prospect.createdAt) {
      context.addIssue({
        code: "custom",
        path: ["updatedAt"],
        message: "updatedAt no puede ser anterior a createdAt.",
      });
    }
  });

export const searchSourceSchema = z.enum([
  "google-places",
  "directorios",
  "instagram",
  "sitios-web",
]);
export const searchStatusSchema = z.enum([
  "borrador",
  "analizando",
  "completada",
  "fallida",
]);

export const searchSchema = z
  .object({
    id: entityIdSchema,
    query: z.string().min(2),
    location: z.string().min(2),
    country: z.string().nullable().optional(),
    resultLimit: z.number().int().positive().max(500),
    sources: z.array(searchSourceSchema).min(1),
    status: searchStatusSchema,
    resultsCount: z.number().int().nonnegative(),
    opportunitiesCount: z.number().int().nonnegative(),
    insertedCount: z.number().int().nonnegative().optional().default(0),
    deduplicatedCount: z.number().int().nonnegative().optional().default(0),
    providerCallCount: z.number().int().nonnegative().optional().default(0),
    provisionalWebsiteCount: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .default(0),
    noWebsiteCount: z.number().int().nonnegative().optional().default(0),
    progress: z.number().int().min(0).max(100).optional().default(0),
    processingStage: z
      .enum([
        "pendiente",
        "descubriendo",
        "guardando",
        "preparando",
        "finalizado",
        "fallido",
      ])
      .optional()
      .default("pendiente"),
    externalRunId: z.string().nullable().optional(),
    retryCount: z.number().int().nonnegative().optional().default(0),
    errorMessage: z.string().nullable().optional(),
    createdAt: isoDateSchema,
  })
  .superRefine((search, context) => {
    if (search.resultsCount > search.resultLimit) {
      context.addIssue({
        code: "custom",
        path: ["resultsCount"],
        message: "resultsCount no puede superar resultLimit.",
      });
    }

    if (search.opportunitiesCount > search.resultsCount) {
      context.addIssue({
        code: "custom",
        path: ["opportunitiesCount"],
        message: "opportunitiesCount no puede superar resultsCount.",
      });
    }
  });

export const proposalStatusSchema = z.enum([
  "borrador",
  "lista",
  "enviada",
  "aceptada",
  "negociacion",
  "descartada",
]);

export const proposalSchema = z
  .object({
    id: entityIdSchema,
    prospectId: entityIdSchema,
    service: z.string().min(2),
    price: z.number().nonnegative(),
    currency: z.enum(["USD"]),
    status: proposalStatusSchema,
    summary: z.string().min(2),
    includedItems: z.array(z.string().min(2)).min(1),
    recommendedAngle: z.string().min(2),
    deliveryTime: z.string().min(2),
    callToAction: z.string().min(2),
    createdAt: isoDateSchema,
    updatedAt: isoDateSchema,
  })
  .refine((proposal) => proposal.updatedAt >= proposal.createdAt, {
    path: ["updatedAt"],
    message: "updatedAt no puede ser anterior a createdAt.",
  });

export const conversationChannelSchema = z.enum([
  "correo",
  "whatsapp",
  "telefono",
]);
export const conversationStatusSchema = z.enum([
  "sin-contactar",
  "esperando-respuesta",
  "respondio",
  "seguimiento",
  "cerrada",
]);

export const conversationMessageSchema = z.object({
  id: entityIdSchema,
  direction: z.enum(["entrante", "saliente"]),
  body: z.string().min(1),
  createdAt: isoDateSchema,
});

export const conversationSchema = z.object({
  id: entityIdSchema,
  prospectId: entityIdSchema,
  channel: conversationChannelSchema,
  status: conversationStatusSchema,
  messages: z.array(conversationMessageSchema),
  lastActivityAt: isoDateSchema,
  nextAction: z.string().min(2).nullable(),
  followUpAt: isoDateSchema.nullable(),
});

export const activityTypeSchema = z.enum([
  "busqueda",
  "prospecto",
  "propuesta",
  "contacto",
  "respuesta",
  "seguimiento",
]);

export const activitySchema = z.object({
  id: entityIdSchema,
  type: activityTypeSchema,
  description: z.string().min(2),
  createdAt: isoDateSchema,
});
