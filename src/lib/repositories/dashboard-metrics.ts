import type {
  DashboardMetrics,
  ProspectingFunnel,
  TodayRecommendation,
} from "@/lib/domain";

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

export async function getProspectingFunnel(): Promise<ProspectingFunnel> {
  const [prospects, proposals, conversations] = await Promise.all([
    prospectRepository.getAll(),
    proposalRepository.getAll(),
    conversationRepository.getAll(),
  ]);
  const qualifiedStatuses = new Set([
    "calificado",
    "alta-prioridad",
    "propuesta-lista",
    "contactado",
    "respondio",
    "seguimiento",
    "negociacion",
    "ganado",
  ]);

  return {
    found: prospects.length,
    qualified: prospects.filter((prospect) =>
      qualifiedStatuses.has(prospect.commercialStatus),
    ).length,
    proposals: proposals.length,
    contacted: conversations.filter((conversation) =>
      conversation.messages.some((message) => message.direction === "saliente"),
    ).length,
    responded: conversations.filter((conversation) =>
      conversation.messages.some((message) => message.direction === "entrante"),
    ).length,
  };
}

export async function getTodayRecommendations(): Promise<
  TodayRecommendation[]
> {
  const [prospects, proposals, conversations] = await Promise.all([
    prospectRepository.getAll(),
    proposalRepository.getAll(),
    conversationRepository.getAll(),
  ]);
  const highScoreProspects = prospects.filter(
    (prospect) => prospect.opportunityScore >= 85,
  ).length;
  const proposalsToReview = proposals.filter((proposal) =>
    ["borrador", "lista"].includes(proposal.status),
  ).length;
  const pendingResponses = conversations.filter(
    (conversation) =>
      ["respondio", "seguimiento"].includes(conversation.status) &&
      conversation.nextAction,
  ).length;

  return [
    {
      id: "high-score-prospects",
      description: `Prioriza ${highScoreProspects} prospectos con puntaje de 85 o más.`,
    },
    {
      id: "proposals-to-review",
      description: `Revisa ${proposalsToReview} propuestas pendientes antes de contactar.`,
    },
    {
      id: "pending-responses",
      description: `Da seguimiento a ${pendingResponses} conversaciones con una próxima acción.`,
    },
  ];
}
