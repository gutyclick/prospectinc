import type { Proposal } from "@/lib/domain";
import { mockProposals } from "@/lib/mock-data";

export type ProposalRepository = {
  getAll(): Promise<Proposal[]>;
  getRecentProposals(limit?: number): Promise<Proposal[]>;
  getByProspectId(prospectId: string): Promise<Proposal[]>;
};

export const proposalRepository: ProposalRepository = {
  async getAll() {
    return [...mockProposals];
  },

  async getRecentProposals(limit = 5) {
    return mockProposals
      .toSorted((first, second) =>
        second.updatedAt.localeCompare(first.updatedAt),
      )
      .slice(0, limit);
  },

  async getByProspectId(prospectId) {
    return mockProposals.filter(
      (proposal) => proposal.prospectId === prospectId,
    );
  },
};
