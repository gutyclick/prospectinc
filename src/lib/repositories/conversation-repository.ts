import type {
  CommercialStatus,
  Conversation,
  ConversationStatus,
  InboxItem,
} from "@/lib/domain";
import { mockConversations } from "@/lib/mock-data";
import { conversationSchema } from "@/lib/validation";

import { prospectRepository } from "./prospect-repository";

export type ConversationRepository = {
  getAll(): Promise<Conversation[]>;
  getInboxItems(limit?: number): Promise<InboxItem[]>;
  getDraftResponse(id: string): Promise<string>;
  saveDraftResponse(id: string, response: string): Promise<void>;
  markResponseSent(id: string, response: string): Promise<Conversation>;
  scheduleFollowUp(id: string, followUpAt: string): Promise<Conversation>;
  updateStatus(
    id: string,
    status: ConversationStatus,
    nextAction: string | null,
  ): Promise<Conversation>;
  transitionCommercial?(
    id: string,
    status: ConversationStatus,
    commercialStatus: CommercialStatus,
    nextAction: string | null,
    followUpAt: string | null,
  ): Promise<Conversation>;
};

let conversations: Conversation[] = mockConversations.map((conversation) => ({
  ...conversation,
  messages: [...conversation.messages],
}));
let draftResponses: Record<string, string> = {};
let sequence = 0;

function updateConversation(id: string, changes: Partial<Conversation>) {
  const current = conversations.find((conversation) => conversation.id === id);
  if (!current) throw new Error("La conversación no existe.");
  const updated = conversationSchema.parse({ ...current, ...changes });
  conversations = conversations.map((conversation) =>
    conversation.id === id ? updated : conversation,
  );
  return updated;
}

export const conversationRepository: ConversationRepository & {
  reset(): void;
} = {
  async getAll() {
    return conversations.map((conversation) => ({
      ...conversation,
      messages: [...conversation.messages],
    }));
  },

  async getInboxItems(limit = 10) {
    const sorted = conversations
      .toSorted((first, second) =>
        second.lastActivityAt.localeCompare(first.lastActivityAt),
      )
      .slice(0, limit);
    return Promise.all(
      sorted.map(async (conversation) => {
        const prospect = await prospectRepository.getProspectById(
          conversation.prospectId,
        );
        if (!prospect)
          throw new Error(`No existe el prospecto ${conversation.prospectId}.`);
        return {
          ...conversation,
          messages: [...conversation.messages],
          prospect,
        };
      }),
    );
  },

  async getDraftResponse(id) {
    return draftResponses[id] ?? "";
  },

  async saveDraftResponse(id, response) {
    if (!conversations.some((conversation) => conversation.id === id))
      throw new Error("La conversación no existe.");
    draftResponses = { ...draftResponses, [id]: response };
  },

  async markResponseSent(id, response) {
    const current = conversations.find(
      (conversation) => conversation.id === id,
    );
    if (!current) throw new Error("La conversación no existe.");
    const timestamp = new Date().toISOString();
    sequence += 1;
    const updated = updateConversation(id, {
      status: "esperando-respuesta",
      messages: [
        ...current.messages,
        {
          id: `message-simulated-${Date.now()}-${sequence}`,
          direction: "saliente",
          body: response,
          createdAt: timestamp,
        },
      ],
      lastActivityAt: timestamp,
      nextAction: "Esperar respuesta y revisar el seguimiento",
    });
    draftResponses = { ...draftResponses, [id]: "" };
    return updated;
  },

  async scheduleFollowUp(id, followUpAt) {
    return updateConversation(id, {
      status: "seguimiento",
      followUpAt,
      nextAction: "Realizar seguimiento programado",
    });
  },

  async updateStatus(id, status, nextAction) {
    return updateConversation(id, { status, nextAction });
  },

  reset() {
    conversations = mockConversations.map((conversation) => ({
      ...conversation,
      messages: [...conversation.messages],
    }));
    draftResponses = {};
    sequence = 0;
  },
};
