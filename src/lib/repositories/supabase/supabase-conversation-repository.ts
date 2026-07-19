import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CommercialStatus,
  ConversationStatus,
  InboxItem,
} from "@/lib/domain";
import type { ConversationRepository } from "../conversation-repository";
import { mapProviderError, RepositoryError } from "../repository-error";
import { mapConversation, mapProspect } from "./mappers";
import type { Database } from "@/types/database.types";

export class SupabaseConversationRepository implements ConversationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}
  private async load(limit?: number): Promise<InboxItem[]> {
    let query = this.client
      .from("conversations")
      .select("*")
      .order("last_activity_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data: conversations, error } = await query;
    if (error) throw mapProviderError(error, "No se pudo cargar la bandeja.");
    if (conversations.length === 0) return [];
    const conversationIds = conversations.map((item) => item.id);
    const prospectIds = [
      ...new Set(conversations.map((item) => item.prospect_id)),
    ];
    const [
      { data: messages, error: messageError },
      { data: prospects, error: prospectError },
      { data: contacts, error: contactError },
    ] = await Promise.all([
      this.client
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("occurred_at"),
      this.client.from("prospects").select("*").in("id", prospectIds),
      this.client
        .from("contact_points")
        .select("*")
        .in("prospect_id", prospectIds),
    ]);
    if (messageError || prospectError || contactError)
      throw mapProviderError(
        messageError ?? prospectError ?? contactError!,
        "No se pudo completar la bandeja.",
      );
    const prospectMap = new Map(
      (prospects ?? []).map((row) => [
        row.id,
        mapProspect(
          row,
          (contacts ?? []).filter((contact) => contact.prospect_id === row.id),
        ),
      ]),
    );
    return conversations.map((row) => {
      const prospect = prospectMap.get(row.prospect_id);
      if (!prospect)
        throw new RepositoryError(
          "Falta el prospecto de una conversación.",
          "validation",
        );
      return {
        ...mapConversation(
          row,
          (messages ?? []).filter(
            (message) => message.conversation_id === row.id,
          ),
        ),
        prospect,
      };
    });
  }
  async getAll() {
    return (await this.load()).map((item) => {
      const conversation = { ...item };
      delete (conversation as Partial<typeof item>).prospect;
      return conversation;
    });
  }
  async getInboxItems(limit = 10) {
    return this.load(limit);
  }
  async getDraftResponse(id: string) {
    const { data, error } = await this.client
      .from("conversations")
      .select("draft_response")
      .eq("id", id)
      .single();
    if (error) throw mapProviderError(error, "No se pudo cargar el borrador.");
    return data.draft_response;
  }
  async saveDraftResponse(id: string, response: string) {
    const { error } = await this.client
      .from("conversations")
      .update({ draft_response: response })
      .eq("id", id);
    if (error) throw mapProviderError(error, "No se pudo guardar el borrador.");
  }
  async markResponseSent(id: string, response: string) {
    const { error } = await this.client.rpc("mark_response_sent", {
      conversation_id: id,
      response_body: response,
    });
    if (error)
      throw mapProviderError(error, "No se pudo registrar la respuesta.");
    const item = (await this.load()).find((candidate) => candidate.id === id);
    if (!item)
      throw new RepositoryError("La conversación no existe.", "not-found");
    return item;
  }
  async scheduleFollowUp(id: string, followUpAt: string) {
    return this.transitionCommercial(
      id,
      "seguimiento",
      "seguimiento",
      "Realizar seguimiento programado",
      followUpAt,
    );
  }
  async updateStatus(
    id: string,
    status: ConversationStatus,
    nextAction: string | null,
  ) {
    const commercial: CommercialStatus =
      status === "cerrada"
        ? "descartado"
        : status === "respondio"
          ? "respondio"
          : status === "seguimiento"
            ? "seguimiento"
            : "contactado";
    return this.transitionCommercial(id, status, commercial, nextAction, null);
  }
  async transitionCommercial(
    id: string,
    conversationStatus: ConversationStatus,
    commercialStatus: CommercialStatus,
    nextAction: string | null,
    followUpAt: string | null,
  ) {
    const { error } = await this.client.rpc("transition_conversation", {
      conversation_id: id,
      conversation_state: conversationStatus,
      commercial_state: commercialStatus,
      action_text: nextAction ?? undefined,
      follow_up_time: followUpAt ?? undefined,
    });
    if (error)
      throw mapProviderError(error, "No se pudo actualizar la conversación.");
    const item = (await this.load()).find((candidate) => candidate.id === id);
    if (!item)
      throw new RepositoryError("La conversación no existe.", "not-found");
    return item;
  }
}
