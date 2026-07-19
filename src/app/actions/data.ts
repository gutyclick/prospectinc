"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type {
  CommercialStatus,
  ConversationStatus,
  ProposalStatus,
} from "@/lib/domain";
import { getRepositories, RepositoryError } from "@/lib/repositories";
import { requireOwner } from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";
import {
  BusinessDiscoveryService,
  RepeatedBusinessSearchError,
} from "@/lib/services/business-discovery-service";
import { GooglePlacesDiscoveryProvider } from "@/lib/services/google-places-discovery-provider";
import {
  proposalFormSchema,
  prospectFormSchema,
  searchFormSchema,
} from "@/lib/validation";

export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: string };

async function execute<T>(
  operation: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await operation() };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof RepositoryError
          ? error.message
          : "Ocurrió un error inesperado. Intenta nuevamente.",
    };
  }
}

export async function createSearchAction(input: unknown) {
  return execute(async () => {
    const values = searchFormSchema.parse(input);
    const repositories = await getRepositories();
    const search = await repositories.searches.createSearch({
      query: values.query,
      location: values.location,
      resultLimit: values.resultLimit,
      sources: values.sources,
    });
    revalidatePath("/busquedas");
    revalidatePath("/");
    return search;
  });
}

export async function completeSearchAction(id: unknown) {
  return execute(async () => {
    const searchId = z.string().uuid().parse(id);
    const repositories = await getRepositories();
    const search = await repositories.searches.completeSearch(searchId);
    revalidatePath("/busquedas");
    revalidatePath("/");
    return search;
  });
}

export async function discoverBusinessesAction(input: unknown) {
  try {
    const values = searchFormSchema
      .extend({ confirmRepeated: z.boolean().optional().default(false) })
      .parse(input);
    const [client, owner] = await Promise.all([createClient(), requireOwner()]);
    const result = await new BusinessDiscoveryService(
      client,
      owner.id,
      new GooglePlacesDiscoveryProvider(),
    ).run({
      niche: values.query,
      location: values.location,
      country: values.country,
      limit: values.resultLimit,
      sources: ["google-places"],
      confirmRepeated: values.confirmRepeated,
    });
    revalidatePath("/busquedas");
    revalidatePath("/prospectos");
    revalidatePath("/");
    return { ok: true, data: result } as const;
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo completar la búsqueda.",
      requiresConfirmation: error instanceof RepeatedBusinessSearchError,
    } as const;
  }
}

export async function createProspectAction(input: unknown) {
  return execute(async () => {
    const values = prospectFormSchema.parse(input);
    const repositories = await getRepositories();
    const prospect = await repositories.prospects.createProspect(values);
    revalidatePath("/prospectos");
    revalidatePath("/");
    return prospect;
  });
}

export async function updateProspectStatusAction(id: unknown, status: unknown) {
  return execute(async () => {
    const prospectId = z.string().uuid().parse(id);
    const commercialStatus = z
      .enum([
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
      ])
      .parse(status) satisfies CommercialStatus;
    const repositories = await getRepositories();
    const prospect = await repositories.prospects.updateCommercialStatus(
      prospectId,
      commercialStatus,
    );
    revalidatePath("/prospectos");
    revalidatePath("/");
    return prospect;
  });
}

export async function createProposalAction(input: unknown) {
  return execute(async () => {
    const values = proposalFormSchema.parse(input);
    const repositories = await getRepositories();
    const prospect = await repositories.prospects.getProspectById(
      values.prospectId,
    );
    if (!prospect)
      throw new RepositoryError("El prospecto no existe.", "not-found");
    const proposal = await repositories.proposals.create({
      prospectId: values.prospectId,
      service: values.service,
      price: values.price,
      currency: values.currency,
      summary: values.summary,
      includedItems: values.includedItems
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      recommendedAngle: prospect.recommendedOffer,
      deliveryTime: values.deliveryTime,
      callToAction: values.callToAction,
    });
    revalidatePath("/propuestas");
    revalidatePath("/");
    return proposal;
  });
}

export async function updateProposalStatusAction(id: unknown, status: unknown) {
  return execute(async () => {
    const proposalId = z.string().uuid().parse(id);
    const proposalStatus = z
      .enum([
        "borrador",
        "lista",
        "enviada",
        "aceptada",
        "negociacion",
        "descartada",
      ])
      .parse(status) satisfies ProposalStatus;
    const repositories = await getRepositories();
    const proposal = await repositories.proposals.updateStatus(
      proposalId,
      proposalStatus,
    );
    revalidatePath("/propuestas");
    revalidatePath("/");
    return proposal;
  });
}

const transitionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "sin-contactar",
    "esperando-respuesta",
    "respondio",
    "seguimiento",
    "cerrada",
  ]),
  commercialStatus: z.enum([
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
  ]),
  nextAction: z.string().nullable(),
  followUpAt: z.iso.datetime({ offset: true }).nullable(),
});

export async function transitionConversationAction(input: unknown) {
  return execute(async () => {
    const values = transitionSchema.parse(input);
    const repositories = await getRepositories();
    if (!repositories.conversations.transitionCommercial)
      throw new RepositoryError("La transición no está disponible.");
    const conversation = await repositories.conversations.transitionCommercial(
      values.id,
      values.status satisfies ConversationStatus,
      values.commercialStatus satisfies CommercialStatus,
      values.nextAction,
      values.followUpAt,
    );
    revalidatePath("/bandeja");
    revalidatePath("/prospectos");
    revalidatePath("/");
    return conversation;
  });
}

export async function saveDraftResponseAction(id: unknown, response: unknown) {
  return execute(async () => {
    const conversationId = z.string().uuid().parse(id);
    const body = z.string().max(10000).parse(response);
    const repositories = await getRepositories();
    await repositories.conversations.saveDraftResponse(conversationId, body);
    revalidatePath("/bandeja");
    return null;
  });
}
export async function markResponseSentAction(id: unknown, response: unknown) {
  return execute(async () => {
    const conversationId = z.string().uuid().parse(id);
    const body = z.string().trim().min(1).max(10000).parse(response);
    const repositories = await getRepositories();
    const conversation = await repositories.conversations.markResponseSent(
      conversationId,
      body,
    );
    revalidatePath("/bandeja");
    revalidatePath("/");
    return conversation;
  });
}
export async function getDraftResponseAction(id: unknown) {
  return execute(async () => {
    const conversationId = z.string().uuid().parse(id);
    return (await getRepositories()).conversations.getDraftResponse(
      conversationId,
    );
  });
}
export async function getInboxItemsAction() {
  return execute(async () =>
    (await getRepositories()).conversations.getInboxItems(50),
  );
}

export async function addExclusionAction(input: unknown) {
  return execute(async () => {
    const values = z
      .object({
        type: z.enum(["email", "phone", "whatsapp"]),
        normalizedValue: z.string().trim().min(1),
        reason: z.string().trim().min(2).max(500),
      })
      .parse(input);
    const repositories = await getRepositories();
    if (!repositories.prospects.addToExclusionList)
      throw new RepositoryError("La lista de exclusión no está disponible.");
    await repositories.prospects.addToExclusionList(
      values.type,
      values.normalizedValue,
      values.reason,
    );
    revalidatePath("/prospectos");
    return null;
  });
}

export async function importDemoDataAction() {
  return execute(async () => {
    const repositories = await getRepositories();
    if (!repositories.activities.importDemoData)
      throw new RepositoryError(
        "La importación demo solo está disponible con Supabase.",
      );
    const imported = await repositories.activities.importDemoData();
    revalidatePath("/");
    revalidatePath("/prospectos");
    return imported;
  });
}
