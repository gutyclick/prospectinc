import { describe, expect, it } from "vitest";

import { mockProposals, mockProspects } from "@/lib/mock-data";

import {
  calculateProposalMetrics,
  generateProposalContent,
} from "./proposal-tools";

describe("herramientas de propuestas", () => {
  it("calcula cantidades y valor monetario de propuestas activas", () => {
    expect(calculateProposalMetrics(mockProposals)).toEqual({
      total: 5,
      ready: 1,
      accepted: 1,
      estimatedValue: 3250,
    });
  });

  it("genera contenido determinístico según prospecto y plantilla", () => {
    const first = generateProposalContent(mockProspects[0], "reservas-online");
    const second = generateProposalContent(mockProspects[0], "reservas-online");

    expect(first).toEqual(second);
    expect(first.service).toBe("Web con reservas online");
    expect(first.summary).toContain("Clínica Dental Nova");
  });
});
