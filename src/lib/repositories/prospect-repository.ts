import type { CommercialStatus, Prospect, WebsiteStatus } from "@/lib/domain";
import { mockProspects } from "@/lib/mock-data";
import { prospectSchema } from "@/lib/validation";

export type CreateProspectInput = {
  businessName: string;
  niche: string;
  location: string;
  websiteUrl: string | null;
  websiteStatus: WebsiteStatus;
  publicEmail: string | null;
  publicPhone: string | null;
  publicWhatsapp: string | null;
  contactSourceUrl: string | null;
  opportunityScore: number;
};

export type ProspectRepository = {
  getAll(): Promise<Prospect[]>;
  getPriorityProspects(limit?: number): Promise<Prospect[]>;
  getProspectById(id: string): Promise<Prospect | null>;
  createProspect(input: CreateProspectInput): Promise<Prospect>;
  updateCommercialStatus(
    id: string,
    status: CommercialStatus,
  ): Promise<Prospect>;
};

let prospects: Prospect[] = [...mockProspects];
let sequence = 0;

export const prospectRepository: ProspectRepository & { reset(): void } = {
  async getAll() {
    return [...prospects];
  },

  async getPriorityProspects(limit = 5) {
    return prospects
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
    return prospects.find((prospect) => prospect.id === id) ?? null;
  },

  async createProspect(input) {
    sequence += 1;
    const timestamp = new Date().toISOString();
    const prospect = prospectSchema.parse({
      id: `prospect-manual-${Date.now()}-${sequence}`,
      ...input,
      commercialStatus: "nuevo",
      recommendedOffer: "Auditoría digital y propuesta web personalizada",
      aiSummary:
        "Prospecto añadido manualmente. El resumen es simulado y debe revisarse antes de preparar una propuesta.",
      detectedOpportunities: [
        "Revisar la presencia digital declarada",
        "Validar el contacto público y su fuente",
        "Preparar una oferta ajustada al nicho",
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    prospects = [prospect, ...prospects];
    return prospect;
  },

  async updateCommercialStatus(id, status) {
    const current = prospects.find((prospect) => prospect.id === id);
    if (!current) throw new Error("El prospecto no existe.");
    const updated = prospectSchema.parse({
      ...current,
      commercialStatus: status,
      updatedAt: new Date().toISOString(),
    });
    prospects = prospects.map((prospect) =>
      prospect.id === id ? updated : prospect,
    );
    return updated;
  },

  reset() {
    prospects = [...mockProspects];
    sequence = 0;
  },
};
