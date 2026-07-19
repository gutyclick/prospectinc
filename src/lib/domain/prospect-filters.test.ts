import { describe, expect, it } from "vitest";

import { mockProspects } from "@/lib/mock-data";

import {
  applyProspectFilters,
  DEFAULT_PROSPECT_FILTERS,
} from "./prospect-filters";

describe("filtros de prospectos", () => {
  it("combina texto, canal y puntaje sin mutar los datos", () => {
    const originalOrder = mockProspects.map((prospect) => prospect.id);
    const filtered = applyProspectFilters(mockProspects, {
      ...DEFAULT_PROSPECT_FILTERS,
      query: "panamá",
      channel: "whatsapp",
      minimumScore: 80,
    });

    expect(filtered.map((prospect) => prospect.businessName)).toEqual([
      "Clínica Dental Nova",
      "Restaurante La Toscana",
    ]);
    expect(mockProspects.map((prospect) => prospect.id)).toEqual(originalOrder);
  });

  it("ordena por puntaje ascendente", () => {
    const filtered = applyProspectFilters(mockProspects, {
      ...DEFAULT_PROSPECT_FILTERS,
      sort: "score-asc",
    });

    expect(filtered[0]?.businessName).toBe("Inmobiliaria Central");
    expect(filtered.at(-1)?.businessName).toBe("Clínica Dental Nova");
  });
});
