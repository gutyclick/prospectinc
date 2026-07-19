import { describe, expect, it } from "vitest";

import {
  activitySchema,
  conversationSchema,
  proposalSchema,
  prospectSchema,
  searchSchema,
} from "./domain-schemas";
import {
  mockActivities,
  mockConversations,
  mockProposals,
  mockProspects,
  mockSearches,
} from "@/lib/mock-data";

describe("esquemas de dominio", () => {
  it("valida todos los datos simulados", () => {
    expect(prospectSchema.array().safeParse(mockProspects).success).toBe(true);
    expect(searchSchema.array().safeParse(mockSearches).success).toBe(true);
    expect(proposalSchema.array().safeParse(mockProposals).success).toBe(true);
    expect(
      conversationSchema.array().safeParse(mockConversations).success,
    ).toBe(true);
    expect(activitySchema.array().safeParse(mockActivities).success).toBe(true);
  });

  it("rechaza contactos públicos sin URL de origen", () => {
    const prospect = { ...mockProspects[0], contactSourceUrl: null };

    const result = prospectSchema.safeParse(prospect);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["contactSourceUrl"],
          }),
        ]),
      );
    }
  });

  it("limita el puntaje de oportunidad al intervalo de 0 a 100", () => {
    const prospect = { ...mockProspects[0], opportunityScore: 101 };

    expect(prospectSchema.safeParse(prospect).success).toBe(false);
  });

  it("rechaza métricas de búsqueda incoherentes", () => {
    const search = { ...mockSearches[0], opportunitiesCount: 51 };

    expect(searchSchema.safeParse(search).success).toBe(false);
  });
});
