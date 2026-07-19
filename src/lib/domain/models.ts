import type { z } from "zod";

import type {
  activitySchema,
  activityTypeSchema,
  commercialStatusSchema,
  conversationChannelSchema,
  conversationMessageSchema,
  conversationSchema,
  conversationStatusSchema,
  proposalSchema,
  proposalStatusSchema,
  prospectSchema,
  searchSchema,
  searchSourceSchema,
  searchStatusSchema,
  websiteStatusSchema,
} from "@/lib/validation/domain-schemas";

export type WebsiteStatus = z.infer<typeof websiteStatusSchema>;
export type CommercialStatus = z.infer<typeof commercialStatusSchema>;
export type Prospect = z.infer<typeof prospectSchema>;

export type SearchSource = z.infer<typeof searchSourceSchema>;
export type SearchStatus = z.infer<typeof searchStatusSchema>;
export type Search = z.infer<typeof searchSchema>;

export type ProposalStatus = z.infer<typeof proposalStatusSchema>;
export type Proposal = z.infer<typeof proposalSchema>;

export type ConversationChannel = z.infer<typeof conversationChannelSchema>;
export type ConversationStatus = z.infer<typeof conversationStatusSchema>;
export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;

export type InboxItem = Conversation & {
  prospect: Prospect;
};

export type ActivityType = z.infer<typeof activityTypeSchema>;
export type Activity = z.infer<typeof activitySchema>;

export type DashboardMetrics = {
  prospectsTotal: number;
  priorityProspects: number;
  readyProposals: number;
  inboxResponses: number;
  completedSearches: number;
  averageOpportunityScore: number;
};

export type ProspectingFunnel = {
  found: number;
  qualified: number;
  proposals: number;
  contacted: number;
  responded: number;
};

export type TodayRecommendation = {
  id: string;
  description: string;
};
