import { describe, expect, it } from "vitest";

import {
  activityRepository,
  conversationRepository,
  getDashboardMetrics,
  proposalRepository,
  prospectRepository,
  searchRepository,
} from "./index";

describe("repositorios simulados", () => {
  it("devuelve prospectos prioritarios ordenados por puntaje", async () => {
    const prospects = await prospectRepository.getPriorityProspects();

    expect(prospects.map((prospect) => prospect.businessName)).toEqual([
      "Clínica Dental Nova",
      "Taller AutoMax",
      "Restaurante La Toscana",
    ]);
    expect(prospects.every((prospect) => prospect.opportunityScore >= 80)).toBe(
      true,
    );
  });

  it("encuentra un prospecto por id y devuelve null si no existe", async () => {
    await expect(
      prospectRepository.getProspectById("prospect-clinica-dental-nova"),
    ).resolves.toMatchObject({ businessName: "Clínica Dental Nova" });
    await expect(
      prospectRepository.getProspectById("prospect-inexistente"),
    ).resolves.toBeNull();
  });

  it("ordena y limita búsquedas, propuestas y actividades recientes", async () => {
    const [searches, proposals, activities] = await Promise.all([
      searchRepository.getRecentSearches(2),
      proposalRepository.getRecentProposals(2),
      activityRepository.getRecentActivities(2),
    ]);

    expect(searches.map((search) => search.id)).toEqual([
      "search-dentistas-panama",
      "search-restaurantes-panama-oeste",
    ]);
    expect(proposals.map((proposal) => proposal.id)).toEqual([
      "proposal-restaurante-la-toscana",
      "proposal-spa-aura",
    ]);
    expect(activities.map((activity) => activity.id)).toEqual([
      "activity-search-dentists",
      "activity-response-toscana",
    ]);
  });

  it("enriquece la bandeja con su prospecto relacionado", async () => {
    const inboxItems = await conversationRepository.getInboxItems();

    expect(inboxItems).not.toHaveLength(0);
    for (const item of inboxItems) {
      expect(item.prospect.id).toBe(item.prospectId);
    }
  });
});

describe("relaciones del dominio", () => {
  it("vincula cada propuesta con un prospecto existente", async () => {
    const proposals = await proposalRepository.getAll();

    for (const proposal of proposals) {
      await expect(
        prospectRepository.getProspectById(proposal.prospectId),
      ).resolves.not.toBeNull();
    }
  });

  it("consulta propuestas por prospecto sin duplicar datos", async () => {
    const proposals = await proposalRepository.getByProspectId(
      "prospect-clinica-dental-nova",
    );

    expect(proposals).toHaveLength(1);
    expect(proposals[0]?.service).toBe("Sitio web + citas");
  });
});

describe("métricas del dashboard", () => {
  it("calcula métricas a partir de los repositorios", async () => {
    await expect(getDashboardMetrics()).resolves.toEqual({
      prospectsTotal: 6,
      priorityProspects: 3,
      readyProposals: 1,
      inboxResponses: 1,
      completedSearches: 3,
      averageOpportunityScore: 82,
    });
  });
});
