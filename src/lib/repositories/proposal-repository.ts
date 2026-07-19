import type { Proposal, ProposalStatus } from "@/lib/domain";
import { mockProposals } from "@/lib/mock-data";
import { proposalSchema } from "@/lib/validation";

export type CreateProposalInput = Omit<
  Proposal,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export type ProposalRepository = {
  getAll(): Promise<Proposal[]>;
  getRecentProposals(limit?: number): Promise<Proposal[]>;
  getByProspectId(prospectId: string): Promise<Proposal[]>;
  create(input: CreateProposalInput): Promise<Proposal>;
  updateStatus(id: string, status: ProposalStatus): Promise<Proposal>;
};

let proposals: Proposal[] = [...mockProposals];
let sequence = 0;

export const proposalRepository: ProposalRepository & { reset(): void } = {
  async getAll() {
    return [...proposals];
  },

  async getRecentProposals(limit = 5) {
    return proposals
      .toSorted((first, second) =>
        second.updatedAt.localeCompare(first.updatedAt),
      )
      .slice(0, limit);
  },

  async getByProspectId(prospectId) {
    return proposals.filter((proposal) => proposal.prospectId === prospectId);
  },

  async create(input) {
    sequence += 1;
    const timestamp = new Date().toISOString();
    const proposal = proposalSchema.parse({
      ...input,
      id: `proposal-manual-${Date.now()}-${sequence}`,
      status: "borrador",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    proposals = [proposal, ...proposals];
    return proposal;
  },

  async updateStatus(id, status) {
    const current = proposals.find((proposal) => proposal.id === id);
    if (!current) throw new Error("La propuesta no existe.");
    const updated = proposalSchema.parse({
      ...current,
      status,
      updatedAt: new Date().toISOString(),
    });
    proposals = proposals.map((proposal) =>
      proposal.id === id ? updated : proposal,
    );
    return updated;
  },

  reset() {
    proposals = [...mockProposals];
    sequence = 0;
  },
};
