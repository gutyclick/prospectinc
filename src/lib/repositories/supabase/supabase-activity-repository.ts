import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityRepository } from "../activity-repository";
import { mapProviderError } from "../repository-error";
import { mapActivity } from "./mappers";
import type { Database } from "@/types/database.types";

export class SupabaseActivityRepository implements ActivityRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}
  async getAll() {
    const { data, error } = await this.client
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw mapProviderError(error, "No se pudo cargar la actividad.");
    return data.map(mapActivity);
  }
  async getRecentActivities(limit = 5) {
    return (await this.getAll()).slice(0, limit);
  }
  async importDemoData() {
    const { data, error } = await this.client.rpc("import_demo_data");
    if (error)
      throw mapProviderError(error, "No se pudieron importar los datos demo.");
    return data;
  }
}
