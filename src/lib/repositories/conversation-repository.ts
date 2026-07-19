import type { Conversation, InboxItem } from "@/lib/domain";
import { mockConversations } from "@/lib/mock-data";

import { prospectRepository } from "./prospect-repository";

export type ConversationRepository = {
  getAll(): Promise<Conversation[]>;
  getInboxItems(limit?: number): Promise<InboxItem[]>;
};

export const conversationRepository: ConversationRepository = {
  async getAll() {
    return [...mockConversations];
  },

  async getInboxItems(limit = 10) {
    const conversations = mockConversations
      .toSorted((first, second) =>
        second.lastActivityAt.localeCompare(first.lastActivityAt),
      )
      .slice(0, limit);

    const items = await Promise.all(
      conversations.map(async (conversation) => {
        const prospect = await prospectRepository.getProspectById(
          conversation.prospectId,
        );

        if (!prospect) {
          throw new Error(`No existe el prospecto ${conversation.prospectId}.`);
        }

        return { ...conversation, prospect };
      }),
    );

    return items;
  },
};
