import type { SupabaseClient } from "@supabase/supabase-js";

import type { SearchRepository } from "../search-repository";
import { mapProviderError, RepositoryError } from "../repository-error";
import { mapSearch } from "./mappers";
import type { Database } from "@/types/database.types";

export class SupabaseSearchRepository implements SearchRepository {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly ownerId: string,
  ) {}
  async getAll() {
    const { data, error } = await this.client
      .from("searches")
      .select("*")
      .order("created_at", { ascending: false });
    if (error)
      throw mapProviderError(error, "No se pudieron cargar las búsquedas.");
    return data.map(mapSearch);
  }
  async getRecentSearches(limit = 5) {
    return (await this.getAll()).slice(0, limit);
  }
  async createSearch(input: Parameters<SearchRepository["createSearch"]>[0]) {
    const { data, error } = await this.client
      .from("searches")
      .insert({
        owner_id: this.ownerId,
        query: input.query,
        location: input.location,
        result_limit: input.resultLimit,
        sources: input.sources,
        status: "analizando",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw mapProviderError(error, "No se pudo crear la búsqueda.");
    return mapSearch(data);
  }
  async completeSearch(id: string) {
    const { data: current, error: readError } = await this.client
      .from("searches")
      .select("result_limit")
      .eq("id", id)
      .single();
    if (readError || !current)
      throw new RepositoryError("La búsqueda no existe.", "not-found");
    const results = Math.max(1, Math.round(current.result_limit * 0.8));
    const { data, error } = await this.client
      .from("searches")
      .update({
        status: "completada",
        results_count: results,
        opportunities_count: Math.max(1, Math.round(results * 0.25)),
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error)
      throw mapProviderError(error, "No se pudo completar la búsqueda.");
    return mapSearch(data);
  }
}
