import "server-only";

import { AbortTaskRunError, logger, metadata, task } from "@trigger.dev/sdk";

import { BusinessDiscoveryError } from "@/lib/services/business-discovery";
import {
  deduplicateBusinesses,
  getDiscoveryCacheExpiration,
} from "@/lib/services/business-discovery-service";
import { GooglePlacesDiscoveryProvider } from "@/lib/services/google-places-discovery-provider";
import type { Json } from "@/types/database.types";

import { getAuthorizedTaskContext, markSearchFailed } from "./task-support";
import { analyzeSearchWebsites } from "./website-analysis";

function permanentProviderFailure(error: unknown) {
  return (
    error instanceof BusinessDiscoveryError &&
    (error.code === "credentials" || error.code === "invalid-response")
  );
}

export const discoverBusinesses = task({
  id: "discover-businesses",
  queue: { name: "business-discovery", concurrencyLimit: 2 },
  maxDuration: 300,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1_000,
    maxTimeoutInMs: 10_000,
    factor: 2,
    randomize: true,
  },
  run: async (input: unknown, { signal, ctx }) => {
    const { client, searchId, ownerId } = await getAuthorizedTaskContext(input);
    const { data: search, error } = await client
      .from("searches")
      .select("id,owner_id,query,location,country,result_limit,sources")
      .eq("id", searchId)
      .eq("owner_id", ownerId)
      .single();
    if (error || !search)
      throw new AbortTaskRunError("Búsqueda no autorizada.");

    await client
      .from("searches")
      .update({
        status: "analizando",
        processing_stage: "descubriendo",
        progress: 15,
        error_message: null,
        external_run_id: ctx.run.id,
        started_at: new Date().toISOString(),
        completed_at: null,
      })
      .eq("id", searchId)
      .eq("owner_id", ownerId);
    metadata
      .set("stage", "descubriendo")
      .set("progress", 15)
      .set("searchId", searchId);

    try {
      signal.throwIfAborted();
      const discovery = await new GooglePlacesDiscoveryProvider().search({
        niche: search.query,
        location: search.location,
        country: search.country ?? undefined,
        limit: search.result_limit,
        signal,
      });
      const unique = deduplicateBusinesses(discovery.businesses).slice(
        0,
        search.result_limit,
      );
      signal.throwIfAborted();
      await client
        .from("searches")
        .update({ processing_stage: "guardando", progress: 55 })
        .eq("id", searchId)
        .eq("owner_id", ownerId);
      metadata
        .set("stage", "guardando")
        .set("progress", 55)
        .set("resultCount", unique.length)
        .set("providerRequests", discovery.requestCount);

      const now = new Date();
      await client
        .from("place_discovery_cache")
        .delete()
        .eq("owner_id", ownerId)
        .lte("expires_at", now.toISOString());
      if (unique.length > 0) {
        const expiresAt = getDiscoveryCacheExpiration(now);
        const { error: cacheError } = await client
          .from("place_discovery_cache")
          .upsert(
            unique.map((business) => ({
              owner_id: ownerId,
              search_id: searchId,
              google_place_id: business.placeId,
              payload: business as unknown as Json,
              source: "google_places",
              expires_at: expiresAt,
            })),
            { onConflict: "search_id,google_place_id" },
          );
        if (cacheError)
          throw new Error("No se pudo preparar la caché temporal.");
      }

      const { data: counters, error: persistError } = await client.rpc(
        "persist_discovery_results_for_owner",
        {
          search_record_id: searchId,
          expected_owner_id: ownerId,
          discovered: unique as unknown as Json,
        },
      );
      if (persistError)
        throw new Error("No se pudieron guardar los resultados.");
      await client
        .from("searches")
        .update({ processing_stage: "preparando", progress: 80 })
        .eq("id", searchId)
        .eq("owner_id", ownerId);
      metadata.set("stage", "preparando").set("progress", 80);

      const analyses = await analyzeSearchWebsites.triggerAndWait({
        searchId,
        ownerId,
        force: false,
      });
      signal.throwIfAborted();
      await client
        .from("searches")
        .update({
          status: "completada",
          processing_stage: "finalizado",
          progress: 100,
          completed_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("id", searchId)
        .eq("owner_id", ownerId);
      metadata.set("stage", "finalizado").set("progress", 100);
      logger.info("Descubrimiento finalizado", {
        searchId,
        ownerId,
        results: unique.length,
        providerRequests: discovery.requestCount,
        analysisBatchOk: analyses.ok,
      });
      return { searchId, counters, analysisBatchOk: analyses.ok };
    } catch (error) {
      if (permanentProviderFailure(error)) {
        await markSearchFailed(
          input,
          error instanceof Error
            ? error.message
            : "Error permanente del proveedor.",
          ctx.run.id,
        );
        throw new AbortTaskRunError(
          error instanceof Error
            ? error.message
            : "Error permanente del proveedor.",
        );
      }
      throw error;
    }
  },
  onFailure: async ({ payload, ctx }) => {
    await markSearchFailed(
      payload,
      "La tarea agotó sus reintentos.",
      ctx.run.id,
    );
  },
  onCancel: async ({ payload, ctx }) => {
    await markSearchFailed(payload, "La tarea fue cancelada.", ctx.run.id);
  },
});
