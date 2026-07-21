"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { idempotencyKeys, tasks } from "@trigger.dev/sdk";

import type {
  CommercialStatus,
  ConversationStatus,
  ProposalStatus,
} from "@/lib/domain";
import { getRepositories, RepositoryError } from "@/lib/repositories";
import { requireOwner } from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";
import {
  assertSearchCanRun,
  getSearchFingerprint,
  RepeatedBusinessSearchError,
} from "@/lib/services/business-discovery-service";
import { mapSearch } from "@/lib/repositories/supabase/mappers";
import type { discoverBusinesses } from "@/trigger/discover-businesses";
import type {
  analyzeProspectWebsite,
  analyzeSearchWebsites,
} from "@/trigger/website-analysis";
import {
  proposalFormSchema,
  prospectFormSchema,
  searchFormSchema,
} from "@/lib/validation";
import {
  analyzeProspectWithOpenAI,
  generateProposalWithOpenAI,
} from "@/lib/intelligence/supabase-prospect-intelligence";
import { prepareManualContact } from "@/lib/services/manual-contact-service";
import { recordManualContactSchema } from "@/lib/domain/manual-contact";

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
    const providerInput = {
      niche: values.query,
      location: values.location,
      country: values.country,
      limit: values.resultLimit,
    };
    const queryFingerprint = getSearchFingerprint(providerInput);
    if (!values.confirmRepeated) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await client
        .from("searches")
        .select("id", { count: "exact", head: true })
        .eq("query_fingerprint", queryFingerprint)
        .gte("created_at", since);
      if (error) throw new Error("No se pudo comprobar la búsqueda reciente.");
      assertSearchCanRun(count ?? 0, false);
    }
    const { data: created, error: createError } = await client
      .from("searches")
      .insert({
        owner_id: owner.id,
        query: values.query,
        location: values.location,
        country: values.country?.trim() || null,
        query_fingerprint: queryFingerprint,
        result_limit: values.resultLimit,
        sources: ["google-places"],
        status: "pendiente",
        processing_stage: "pendiente",
        progress: 0,
      })
      .select()
      .single();
    if (createError) {
      if (createError.code === "23505") {
        throw new Error("Ya existe una ejecución activa para esta búsqueda.");
      }
      throw new Error("No se pudo registrar la búsqueda.");
    }
    const idempotencyKey = await idempotencyKeys.create(
      `discovery:${created.id}:0`,
      { scope: "global" },
    );
    let handle;
    try {
      handle = await tasks.trigger<typeof discoverBusinesses>(
        "discover-businesses",
        { searchId: created.id, ownerId: owner.id },
        {
          idempotencyKey,
          idempotencyKeyTTL: "24h",
          tags: [`search:${created.id}`, `owner:${owner.id}`],
          metadata: {
            searchId: created.id,
            ownerId: owner.id,
            stage: "pendiente",
            progress: 0,
          },
        },
      );
    } catch {
      await client
        .from("searches")
        .update({
          status: "fallida",
          processing_stage: "fallido",
          progress: 100,
          error_message: "No se pudo encolar la tarea en segundo plano.",
          completed_at: new Date().toISOString(),
        })
        .eq("id", created.id);
      throw new Error("No se pudo encolar la búsqueda. Intenta nuevamente.");
    }
    await client
      .from("searches")
      .update({ external_run_id: handle.id })
      .eq("id", created.id);
    revalidatePath("/busquedas");
    return {
      ok: true,
      data: {
        search: mapSearch({ ...created, external_run_id: handle.id }),
        runId: handle.id,
        publicAccessToken: handle.publicAccessToken,
      },
    } as const;
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

export async function getSearchStatusAction(id: unknown) {
  return execute(async () => {
    const searchId = z.string().uuid().parse(id);
    const client = await createClient();
    await requireOwner();
    const { data, error } = await client
      .from("searches")
      .select()
      .eq("id", searchId)
      .single();
    if (error || !data)
      throw new RepositoryError("La búsqueda no existe.", "not-found");
    return mapSearch(data);
  });
}

export async function analyzeSearchWebsitesAction(id: unknown) {
  return execute(async () => {
    const searchId = z.string().uuid().parse(id);
    const [client, owner] = await Promise.all([createClient(), requireOwner()]);
    const { data: search, error } = await client
      .from("searches")
      .select("id,status")
      .eq("id", searchId)
      .eq("status", "completada")
      .single();
    if (error || !search)
      throw new RepositoryError(
        "La búsqueda completada no existe.",
        "not-found",
      );
    const idempotencyKey = await idempotencyKeys.create(
      `analyze-search-manual:${search.id}`,
      { scope: "global" },
    );
    const handle = await tasks.trigger<typeof analyzeSearchWebsites>(
      "analyze-search-websites",
      { searchId: search.id, ownerId: owner.id, force: false },
      {
        idempotencyKey,
        idempotencyKeyTTL: "5m",
        tags: [`search:${search.id}`],
      },
    );
    return { runId: handle.id };
  });
}

export async function reanalyzeProspectWebsiteAction(
  id: unknown,
  forceInput: unknown = false,
) {
  return execute(async () => {
    const prospectId = z.string().uuid().parse(id);
    const force = z.boolean().parse(forceInput);
    const [client, owner] = await Promise.all([createClient(), requireOwner()]);
    const { data: prospect, error } = await client
      .from("prospects")
      .select("id,website_url")
      .eq("id", prospectId)
      .single();
    if (error || !prospect)
      throw new RepositoryError("El prospecto no existe.", "not-found");
    if (!prospect.website_url)
      throw new RepositoryError(
        "El prospecto no tiene un sitio web para analizar.",
      );
    const minute = Math.floor(Date.now() / 60_000);
    const startedAt = new Date().toISOString();
    const idempotencyKey = await idempotencyKeys.create(
      `website-manual:${prospect.id}:${minute}`,
      { scope: "global" },
    );
    const handle = await tasks.trigger<typeof analyzeProspectWebsite>(
      "analyze-prospect-website",
      { prospectId: prospect.id, ownerId: owner.id, force },
      {
        idempotencyKey,
        idempotencyKeyTTL: "5m",
        tags: [`prospect:${prospect.id}`],
      },
    );
    return {
      runId: handle.id,
      publicAccessToken: handle.publicAccessToken,
      startedAt,
    };
  });
}

export async function getProspectWebsiteAnalysisStatusAction(
  id: unknown,
  startedAtInput: unknown,
) {
  return execute(async () => {
    const prospectId = z.string().uuid().parse(id);
    const startedAt = z.string().datetime().parse(startedAtInput);
    const client = await createClient();
    await requireOwner();
    const { data, error } = await client
      .from("website_audits")
      .select(
        "id,prospect_id,status,progress,result_status,error_message,analyzed_at,facts,screenshot_path",
      )
      .eq("prospect_id", prospectId)
      .gte("created_at", startedAt)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new RepositoryError("No se pudo consultar el análisis.");
    return data;
  });
}

export async function analyzeProspectWithAiAction(
  id: unknown,
  forceInput: unknown = false,
) {
  return execute(async () => {
    const prospectId = z.string().uuid().parse(id);
    const force = z.boolean().parse(forceInput);
    const result = await analyzeProspectWithOpenAI(prospectId, force);
    revalidatePath("/prospectos");
    revalidatePath("/");
    return result;
  });
}

export async function generateProposalWithAiAction(id: unknown) {
  return execute(async () => {
    const prospectId = z.string().uuid().parse(id);
    const result = await generateProposalWithOpenAI(prospectId);
    revalidatePath("/propuestas");
    revalidatePath("/prospectos");
    return result;
  });
}

export async function retryDiscoveryAction(id: unknown) {
  return execute(async () => {
    const searchId = z.string().uuid().parse(id);
    const [client, owner] = await Promise.all([createClient(), requireOwner()]);
    const { data: search, error } = await client
      .from("searches")
      .select()
      .eq("id", searchId)
      .eq("status", "fallida")
      .single();
    if (error || !search)
      throw new RepositoryError("La búsqueda fallida no existe.", "not-found");
    const retryCount = search.retry_count + 1;
    const { data: reset, error: resetError } = await client
      .from("searches")
      .update({
        status: "pendiente",
        processing_stage: "pendiente",
        progress: 0,
        error_message: null,
        completed_at: null,
        retry_count: retryCount,
        external_run_id: null,
      })
      .eq("id", search.id)
      .eq("status", "fallida")
      .select()
      .single();
    if (resetError || !reset)
      throw new RepositoryError("No se pudo preparar el reintento.");
    const idempotencyKey = await idempotencyKeys.create(
      `discovery:${search.id}:${retryCount}`,
      { scope: "global" },
    );
    let handle;
    try {
      handle = await tasks.trigger<typeof discoverBusinesses>(
        "discover-businesses",
        { searchId: search.id, ownerId: owner.id },
        {
          idempotencyKey,
          idempotencyKeyTTL: "24h",
          tags: [`search:${search.id}`, `owner:${owner.id}`],
        },
      );
    } catch {
      await client
        .from("searches")
        .update({
          status: "fallida",
          processing_stage: "fallido",
          progress: 100,
          error_message: "No se pudo volver a encolar la tarea.",
          completed_at: new Date().toISOString(),
        })
        .eq("id", search.id);
      throw new RepositoryError("No se pudo reintentar la búsqueda.");
    }
    const { data: updated, error: updateError } = await client
      .from("searches")
      .update({
        external_run_id: handle.id,
      })
      .eq("id", search.id)
      .select()
      .single();
    if (updateError)
      throw new RepositoryError("No se pudo reintentar la búsqueda.");
    revalidatePath("/busquedas");
    return {
      search: mapSearch(updated),
      runId: handle.id,
      publicAccessToken: handle.publicAccessToken,
    };
  });
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
    if (proposalStatus === "lista") {
      const client = await createClient();
      await requireOwner();
      await client.rpc("prepare_proposal_conversation", {
        proposal_id: proposalId,
      });
      revalidatePath("/bandeja");
    }
    revalidatePath("/propuestas");
    revalidatePath("/");
    return proposal;
  });
}

export async function prepareManualContactAction(
  id: unknown,
  channelInput: unknown,
) {
  return execute(async () => {
    const proposalId = z.string().uuid().parse(id);
    const channel = z.enum(["correo", "whatsapp"]).parse(channelInput);
    return prepareManualContact(proposalId, channel);
  });
}

export async function recordManualContactAction(input: unknown) {
  return execute(async () => {
    const values = recordManualContactSchema.parse(input);
    const prepared = await prepareManualContact(
      values.proposalId,
      values.channel,
    );
    if (prepared.contactPointId !== values.contactPointId)
      throw new RepositoryError(
        "El contacto preparado ya no está disponible.",
        "validation",
      );
    const client = await createClient();
    await requireOwner();
    const { data, error } = await client.rpc("record_manual_outreach", {
      proposal_id: values.proposalId,
      contact_point_id: values.contactPointId,
      outreach_channel: values.channel,
      message_subject: values.subject,
      message_body: values.body,
      allow_repeat: values.allowRepeat,
      daily_limit: Math.min(
        500,
        Math.max(1, Number(process.env.MANUAL_CONTACT_DAILY_LIMIT ?? 25)),
      ),
      follow_up_time: values.followUpAt ?? undefined,
    });
    if (error) {
      const known = [
        "excluido",
        "límite diario",
        "contacto reciente",
        "revisada",
        "utilizable",
      ];
      const message = known.find((fragment) =>
        error.message.toLowerCase().includes(fragment),
      )
        ? error.message
        : "No se pudo registrar el contacto manual.";
      throw new RepositoryError(message, "validation");
    }
    revalidatePath("/propuestas");
    revalidatePath("/prospectos");
    revalidatePath("/bandeja");
    revalidatePath("/");
    return { conversationId: data };
  });
}

export async function recordManualInboundAction(
  id: unknown,
  bodyInput: unknown,
) {
  return execute(async () => {
    const conversationId = z.string().uuid().parse(id);
    const body = z.string().trim().min(1).max(10_000).parse(bodyInput);
    const client = await createClient();
    await requireOwner();
    const { error } = await client.rpc("record_manual_inbound", {
      conversation_id: conversationId,
      message_body: body,
    });
    if (error)
      throw new RepositoryError(
        "No se pudo registrar la respuesta recibida.",
        "validation",
      );
    revalidatePath("/bandeja");
    revalidatePath("/prospectos");
    revalidatePath("/");
    return { conversationId };
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
