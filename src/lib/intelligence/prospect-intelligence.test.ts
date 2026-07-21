import { describe, expect, it } from "vitest";
import { FakeProspectIntelligenceProvider } from "./fake-prospect-intelligence-provider";
import {
  assertSafeGeneratedProposal,
  generatedProposalSchema,
  prospectAnalysisSchema,
} from "./prospect-intelligence";

const input = {
  businessName: "Negocio",
  niche: "Servicios",
  city: "Panamá",
  auditFacts: ["El sitio usa HTTPS."],
  verifiedContacts: [],
  allowedMetrics: {},
  availableOffer: "Web básica",
};

describe("proveedor simulado y salidas estructuradas", () => {
  it("produce análisis y propuesta válidos", async () => {
    const provider = new FakeProspectIntelligenceProvider();
    expect(
      prospectAnalysisSchema.parse(await provider.analyzeProspect(input))
        .confidence,
    ).toBeLessThanOrEqual(1);
    expect(
      generatedProposalSchema.parse(
        await provider.generateProposal({
          businessName: "Negocio",
          niche: "Servicios",
          city: "Panamá",
          verifiedFacts: input.auditFacts,
          availableOffer: "Web básica",
        }),
      ).includedItems.length,
    ).toBeGreaterThan(0);
  });
  it("rechaza salidas inválidas y límites excedidos", () => {
    expect(
      prospectAnalysisSchema.safeParse({ opportunityScore: 101 }).success,
    ).toBe(false);
    expect(
      generatedProposalSchema.safeParse({ headline: "incompleto" }).success,
    ).toBe(false);
  });
  it("rechaza datos de contacto inventados y promesas prohibidas", async () => {
    const proposal =
      await new FakeProspectIntelligenceProvider().generateProposal({
        businessName: "Negocio",
        niche: "Servicios",
        city: "Panamá",
        verifiedFacts: input.auditFacts,
        availableOffer: "Web básica",
      });
    expect(() =>
      assertSafeGeneratedProposal({
        ...proposal,
        emailBody: "El dueño se llama Juan y garantizamos ventas.",
      }),
    ).toThrow();
    expect(() =>
      assertSafeGeneratedProposal({
        ...proposal,
        whatsappMessage: "Llame al +507 6000-0000",
      }),
    ).toThrow();
  });
});
