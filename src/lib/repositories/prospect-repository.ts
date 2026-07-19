import type { Prospect } from "@/lib/domain";
import { mockProspects } from "@/lib/mock-data";

export type ProspectRepository = {
  getAll(): Promise<Prospect[]>;
  getPriorityProspects(limit?: number): Promise<Prospect[]>;
  getProspectById(id: string): Promise<Prospect | null>;
};

export const prospectRepository: ProspectRepository = {
  async getAll() {
    return [...mockProspects];
  },

  async getPriorityProspects(limit = 5) {
    return mockProspects
      .filter(
        (prospect) =>
          prospect.commercialStatus === "alta-prioridad" ||
          prospect.opportunityScore >= 80,
      )
      .toSorted(
        (first, second) => second.opportunityScore - first.opportunityScore,
      )
      .slice(0, limit);
  },

  async getProspectById(id) {
    return mockProspects.find((prospect) => prospect.id === id) ?? null;
  },
};
