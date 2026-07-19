import { describe, expect, it } from "vitest";

import { mockConversations, mockProspects } from "@/lib/mock-data";

import { simulatedConversationIntelligence } from "./conversation-intelligence";

describe("inteligencia simulada de conversaciones", () => {
  it("clasifica siempre igual una solicitud de información", () => {
    const conversation = mockConversations.find(
      (item) => item.id === "conversation-restaurante-la-toscana",
    );
    const prospect = mockProspects.find(
      (item) => item.id === conversation?.prospectId,
    );
    if (!conversation || !prospect) throw new Error("Fixture incompleto.");

    const first = simulatedConversationIntelligence.classify(
      conversation,
      prospect,
    );
    const second = simulatedConversationIntelligence.classify(
      conversation,
      prospect,
    );
    expect(first).toEqual(second);
    expect(first.intent).toBe("mas-informacion");
    expect(first.suggestedResponse).toContain("reservas");
  });
});
