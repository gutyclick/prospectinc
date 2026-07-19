import type { DashboardMetrics } from "@/lib/domain";

import { conversationRepository } from "./conversation-repository";
import { proposalRepository } from "./proposal-repository";
import { prospectRepository } from "./prospect-repository";
import { searchRepository } from "./search-repository";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [prospects, proposals, conversations, searches] = await Promise.all([
    prospectRepository.getAll(),
    proposalRepository.getAll(),
    conversationRepository.getAll(),
    searchRepository.getAll(),
  ]);

  const totalScore = prospects.reduce(
    (sum, prospect) => sum + prospect.opportunityScore,
    0,
  );

  return {
    prospectsTotal: prospects.length,
    priorityProspects: prospects.filter(
      (prospect) =>
        prospect.commercialStatus === "alta-prioridad" ||
        prospect.opportunityScore >= 80,
    ).length,
    readyProposals: proposals.filter((proposal) => proposal.status === "lista")
      .length,
    inboxResponses: conversations.filter(
      (conversation) => conversation.status === "respondio",
    ).length,
    completedSearches: searches.filter(
      (search) => search.status === "completada",
    ).length,
    averageOpportunityScore:
      prospects.length === 0 ? 0 : Math.round(totalScore / prospects.length),
  };
}
