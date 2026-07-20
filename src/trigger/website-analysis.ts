import "server-only";

import {
  AbortTaskRunError,
  idempotencyKeys,
  logger,
  task,
} from "@trigger.dev/sdk";
import { z } from "zod";

import {
  getAuthorizedOwnerContext,
  getAuthorizedTaskContext,
  ownedTaskPayloadSchema,
} from "./task-support";
import { selectProspectsForAnalysis } from "./task-domain";

const websitePayloadSchema = z.object({
  prospectId: z.string().uuid(),
  ownerId: z.string().uuid(),
  force: z.boolean().default(false),
});

export const analyzeProspectWebsite = task({
  id: "analyze-prospect-website",
  queue: { name: "website-analysis", concurrencyLimit: 3 },
  maxDuration: 120,
  retry: { maxAttempts: 2 },
  run: async (input: unknown, { signal }) => {
    const payload = websitePayloadSchema.safeParse(input);
    if (!payload.success) throw new AbortTaskRunError("Payload inválido.");
    const { client } = await getAuthorizedOwnerContext(payload.data.ownerId);
    signal.throwIfAborted();
    const { data: prospect, error } = await client
      .from("prospects")
      .select("id,website_url")
      .eq("id", payload.data.prospectId)
      .eq("owner_id", payload.data.ownerId)
      .single();
    if (error || !prospect)
      throw new AbortTaskRunError("Prospecto no autorizado.");
    if (!prospect.website_url) return { status: "omitido-sin-sitio" as const };

    const recentSince = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    if (!payload.data.force) {
      const { count } = await client
        .from("website_audits")
        .select("id", { count: "exact", head: true })
        .eq("prospect_id", prospect.id)
        .eq("owner_id", payload.data.ownerId)
        .eq("status", "completada")
        .gte("analyzed_at", recentSince);
      if ((count ?? 0) > 0) return { status: "omitido-reciente" as const };
    }

    const { error: insertError } = await client.from("website_audits").insert({
      owner_id: payload.data.ownerId,
      prospect_id: prospect.id,
      status: "pendiente",
      final_url: prospect.website_url,
      facts: { source: "trigger-skeleton", browserImplemented: false },
    });
    if (insertError) throw new Error("No se pudo preparar la auditoría.");
    logger.info("Auditoría web preparada", { prospectId: prospect.id });
    return { status: "preparado" as const };
  },
});

export const analyzeSearchProspects = task({
  id: "analyze-search-prospects",
  maxDuration: 300,
  retry: { maxAttempts: 2 },
  run: async (input: unknown, { signal, ctx }) => {
    const payload = ownedTaskPayloadSchema
      .extend({ force: z.boolean().default(false) })
      .safeParse(input);
    if (!payload.success) throw new AbortTaskRunError("Payload inválido.");
    const { client } = await getAuthorizedTaskContext(payload.data);
    signal.throwIfAborted();
    const { data: prospects, error } = await client
      .from("prospects")
      .select("id,website_url")
      .eq("search_id", payload.data.searchId)
      .eq("owner_id", payload.data.ownerId);
    if (error) throw new Error("No se pudieron cargar los prospectos.");

    const withWebsite = prospects.filter((prospect) => prospect.website_url);
    if (withWebsite.length === 0)
      return { launched: 0, failed: 0, skipped: prospects.length };

    const recentSince = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const { data: recentAudits } = await client
      .from("website_audits")
      .select("prospect_id")
      .eq("owner_id", payload.data.ownerId)
      .eq("status", "completada")
      .gte("analyzed_at", recentSince)
      .in(
        "prospect_id",
        withWebsite.map((prospect) => prospect.id),
      );
    const recentIds = new Set(
      (recentAudits ?? []).map((audit) => audit.prospect_id),
    );
    const eligible = selectProspectsForAnalysis(
      withWebsite,
      recentIds,
      payload.data.force,
    );

    const items = await Promise.all(
      eligible.map(async (prospect) => ({
        payload: {
          prospectId: prospect.id,
          ownerId: payload.data.ownerId,
          force: payload.data.force,
        },
        options: {
          idempotencyKey: await idempotencyKeys.create(
            `website:${prospect.id}:${ctx.run.id}`,
            { scope: "global" },
          ),
          idempotencyKeyTTL: "1d",
        },
      })),
    );
    signal.throwIfAborted();
    const batch = await analyzeProspectWebsite.batchTriggerAndWait(items);
    const failed = batch.runs.filter((run) => !run.ok).length;
    logger.info("Lote de auditorías preparado", {
      searchId: payload.data.searchId,
      launched: items.length,
      failed,
      skipped: prospects.length - items.length,
    });
    return {
      launched: items.length,
      failed,
      skipped: prospects.length - items.length,
    };
  },
});
