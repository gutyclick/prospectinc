import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProposalStatus } from "@/lib/domain";
import type {
  CreateProposalInput,
  ProposalRepository,
} from "../proposal-repository";
import { mapProviderError, RepositoryError } from "../repository-error";
import { mapProposal } from "./mappers";
import type { Database } from "@/types/database.types";

export class SupabaseProposalRepository implements ProposalRepository {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly ownerId: string,
  ) {}
  async getAll() {
    const { data, error } = await this.client
      .from("proposals")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error)
      throw mapProviderError(error, "No se pudieron cargar las propuestas.");
    return data.map(mapProposal);
  }
  async getRecentProposals(limit = 5) {
    return (await this.getAll()).slice(0, limit);
  }
  async getByProspectId(prospectId: string) {
    const { data, error } = await this.client
      .from("proposals")
      .select("*")
      .eq("prospect_id", prospectId)
      .order("updated_at", { ascending: false });
    if (error)
      throw mapProviderError(error, "No se pudieron cargar las propuestas.");
    return data.map(mapProposal);
  }
  async create(input: CreateProposalInput) {
    const { data, error } = await this.client
      .from("proposals")
      .insert({
        owner_id: this.ownerId,
        prospect_id: input.prospectId,
        service: input.service,
        price: input.price,
        currency: input.currency,
        summary: input.summary,
        included_items: input.includedItems,
        recommended_angle: input.recommendedAngle,
        delivery_time: input.deliveryTime,
        call_to_action: input.callToAction,
        status: "borrador",
      })
      .select()
      .single();
    if (error) throw mapProviderError(error, "No se pudo crear la propuesta.");
    return mapProposal(data);
  }
  async updateStatus(id: string, status: ProposalStatus) {
    const { data, error } = await this.client
      .from("proposals")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error)
      throw mapProviderError(error, "No se pudo actualizar la propuesta.");
    if (!data)
      throw new RepositoryError("La propuesta no existe.", "not-found");
    return mapProposal(data);
  }
}
