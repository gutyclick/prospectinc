import "server-only";

import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { mapSearch } from "@/lib/repositories/supabase/mappers";
import type { Search } from "@/lib/domain";
import type { Database, Json } from "@/types/database.types";

import {
  BusinessDiscoveryError,
  type BusinessDiscoveryProvider,
  type BusinessSearchInput,
} from "./business-discovery";

export class RepeatedBusinessSearchError extends Error {
  constructor() {
    super(
      "Ya realizaste una búsqueda idéntica recientemente. Confirma si deseas repetirla.",
    );
    this.name = "RepeatedBusinessSearchError";
  }
}

export function assertSearchCanRun(
  recentMatches: number,
  confirmRepeated: boolean,
) {
  if (recentMatches > 0 && !confirmRepeated) {
    throw new RepeatedBusinessSearchError();
  }
}

export type DiscoveryRunResult = {
  search: Search;
  inserted: number;
  deduplicated: number;
  providerCalls: 1;
};

type RunInput = BusinessSearchInput & {
  sources: string[];
  confirmRepeated: boolean;
};

export function getSearchFingerprint(input: BusinessSearchInput) {
  return createHash("sha256")
    .update(
      [input.niche, input.location, input.country ?? "", input.limit]
        .map((value) => String(value).trim().toLocaleLowerCase("es"))
        .join("|"),
    )
    .digest("hex");
}

export function deduplicateBusinesses<T extends { placeId: string }>(
  businesses: T[],
) {
  const unique = new Map<string, T>();
  for (const business of businesses) {
    if (!unique.has(business.placeId)) unique.set(business.placeId, business);
  }
  return [...unique.values()];
}

function publicErrorMessage(error: unknown) {
  return error instanceof BusinessDiscoveryError
    ? error.message
    : "No se pudo completar la búsqueda con Google Places.";
}

export class BusinessDiscoveryService {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly ownerId: string,
    private readonly provider: BusinessDiscoveryProvider,
  ) {}

  async run(input: RunInput): Promise<DiscoveryRunResult> {
    const queryFingerprint = getSearchFingerprint(input);
    if (!input.confirmRepeated) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await this.client
        .from("searches")
        .select("id")
        .eq("query_fingerprint", queryFingerprint)
        .gte("created_at", since)
        .limit(1);
      if (error) throw new Error("No se pudo comprobar la búsqueda reciente.");
      assertSearchCanRun(data.length, input.confirmRepeated);
    }

    const { data: created, error: createError } = await this.client
      .from("searches")
      .insert({
        owner_id: this.ownerId,
        query: input.niche,
        location: input.location,
        country: input.country?.trim() || null,
        query_fingerprint: queryFingerprint,
        result_limit: input.limit,
        sources: input.sources,
        status: "analizando",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (createError) throw new Error("No se pudo registrar la búsqueda.");

    try {
      const discovered = await this.provider.search(input);
      const unique = deduplicateBusinesses(discovered).slice(0, input.limit);
      console.info("Google Places Text Search completado", {
        searchId: created.id,
        providerCalls: 1,
        resultCount: unique.length,
      });
      const { data: persisted, error: persistError } = await this.client.rpc(
        "persist_discovery_results",
        {
          search_record_id: created.id,
          discovered: unique as unknown as Json,
        },
      );
      if (persistError)
        throw new Error("No se pudieron guardar los resultados.");
      const { data: completed, error: readError } = await this.client
        .from("searches")
        .select()
        .eq("id", created.id)
        .single();
      if (readError) throw new Error("No se pudo recuperar la búsqueda.");
      const counters = persisted as {
        inserted: number;
        deduplicated: number;
      };
      return {
        search: mapSearch(completed),
        inserted: counters.inserted,
        deduplicated: counters.deduplicated,
        providerCalls: 1,
      };
    } catch (error) {
      await this.client
        .from("searches")
        .update({
          status: "fallida",
          error_message: publicErrorMessage(error),
          provider_call_count: 1,
          completed_at: new Date().toISOString(),
        })
        .eq("id", created.id);
      throw error;
    }
  }
}
