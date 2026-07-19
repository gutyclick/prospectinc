import type { SupabaseClient } from "@supabase/supabase-js";

import type { CommercialStatus } from "@/lib/domain";
import type {
  CreateProspectInput,
  ProspectRepository,
} from "../prospect-repository";
import { mapProviderError, RepositoryError } from "../repository-error";
import { mapProspect } from "./mappers";
import type { Database } from "@/types/database.types";

export class SupabaseProspectRepository implements ProspectRepository {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly ownerId: string,
  ) {}
  private async load() {
    const [{ data: rows, error }, { data: contacts, error: contactError }] =
      await Promise.all([
        this.client
          .from("prospects")
          .select("*")
          .order("opportunity_score", { ascending: false }),
        this.client.from("contact_points").select("*"),
      ]);
    if (error || contactError)
      throw mapProviderError(
        error ?? contactError!,
        "No se pudieron cargar los prospectos.",
      );
    const grouped = new Map<string, NonNullable<typeof contacts>>();
    for (const contact of contacts ?? [])
      grouped.set(contact.prospect_id, [
        ...(grouped.get(contact.prospect_id) ?? []),
        contact,
      ]);
    return (rows ?? []).map((row) =>
      mapProspect(row, grouped.get(row.id) ?? []),
    );
  }
  async getAll() {
    return this.load();
  }
  async getPriorityProspects(limit = 5) {
    return (await this.load())
      .filter(
        (item) =>
          item.commercialStatus === "alta-prioridad" ||
          item.opportunityScore >= 80,
      )
      .slice(0, limit);
  }
  async getProspectById(id: string) {
    return (await this.load()).find((item) => item.id === id) ?? null;
  }
  async createProspect(input: CreateProspectInput) {
    const contacts = [
      { type: "email" as const, value: input.publicEmail },
      { type: "phone" as const, value: input.publicPhone },
      { type: "whatsapp" as const, value: input.publicWhatsapp },
    ].filter(
      (item): item is { type: "email" | "phone" | "whatsapp"; value: string } =>
        Boolean(item.value),
    );
    const { data: id, error } = await this.client.rpc(
      "create_manual_prospect",
      {
        payload: {
          business_name: input.businessName,
          niche: input.niche,
          location: input.location,
          website_url: input.websiteUrl,
          website_status: input.websiteStatus,
          opportunity_score: input.opportunityScore,
          contact_source_url: input.contactSourceUrl,
          contacts,
        },
      },
    );
    if (error) throw mapProviderError(error, "No se pudo crear el prospecto.");
    const prospect = await this.getProspectById(id);
    if (!prospect)
      throw new RepositoryError(
        "El prospecto no se pudo recuperar.",
        "not-found",
      );
    return prospect;
  }
  async updateCommercialStatus(id: string, status: CommercialStatus) {
    const { error } = await this.client
      .from("prospects")
      .update({ commercial_status: status })
      .eq("id", id);
    if (error)
      throw mapProviderError(error, "No se pudo actualizar el prospecto.");
    const prospect = await this.getProspectById(id);
    if (!prospect)
      throw new RepositoryError("El prospecto no existe.", "not-found");
    return prospect;
  }
  async addToExclusionList(
    type: "email" | "phone" | "whatsapp",
    normalizedValue: string,
    reason: string,
  ) {
    const { error } = await this.client.from("exclusion_list").upsert(
      {
        owner_id: this.ownerId,
        contact_type: type,
        normalized_value: normalizedValue,
        reason,
      },
      { onConflict: "owner_id,contact_type,normalized_value" },
    );
    if (error)
      throw mapProviderError(
        error,
        "No se pudo actualizar la lista de exclusión.",
      );
  }
}
