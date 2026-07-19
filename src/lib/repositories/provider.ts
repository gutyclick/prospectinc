import "server-only";

import { requireOwner } from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";

import type { ActivityRepository } from "./activity-repository";
import type { ConversationRepository } from "./conversation-repository";
import type { ProposalRepository } from "./proposal-repository";
import type { ProspectRepository } from "./prospect-repository";
import type { SearchRepository } from "./search-repository";
import { SupabaseActivityRepository } from "./supabase/supabase-activity-repository";
import { SupabaseConversationRepository } from "./supabase/supabase-conversation-repository";
import { SupabaseProposalRepository } from "./supabase/supabase-proposal-repository";
import { SupabaseProspectRepository } from "./supabase/supabase-prospect-repository";
import { SupabaseSearchRepository } from "./supabase/supabase-search-repository";

export type RepositoryBundle = {
  activities: ActivityRepository;
  conversations: ConversationRepository;
  proposals: ProposalRepository;
  prospects: ProspectRepository;
  searches: SearchRepository;
};

export async function getRepositories(): Promise<RepositoryBundle> {
  if (process.env.NODE_ENV === "test") {
    const [activity, conversation, proposal, prospect, search] =
      await Promise.all([
        import("./activity-repository"),
        import("./conversation-repository"),
        import("./proposal-repository"),
        import("./prospect-repository"),
        import("./search-repository"),
      ]);
    return {
      activities: activity.activityRepository,
      conversations: conversation.conversationRepository,
      proposals: proposal.proposalRepository,
      prospects: prospect.prospectRepository,
      searches: search.searchRepository,
    };
  }
  if ((process.env.DATA_PROVIDER ?? "supabase") !== "supabase") {
    throw new Error(
      "DATA_PROVIDER debe configurarse como supabase fuera de pruebas.",
    );
  }
  const [client, user] = await Promise.all([createClient(), requireOwner()]);
  return {
    activities: new SupabaseActivityRepository(client),
    conversations: new SupabaseConversationRepository(client),
    proposals: new SupabaseProposalRepository(client, user.id),
    prospects: new SupabaseProspectRepository(client, user.id),
    searches: new SupabaseSearchRepository(client, user.id),
  };
}
