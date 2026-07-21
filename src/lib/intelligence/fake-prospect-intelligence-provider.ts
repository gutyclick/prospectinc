import type { ProspectIntelligenceProvider } from "./prospect-intelligence";

export class FakeProspectIntelligenceProvider implements ProspectIntelligenceProvider {
  async analyzeProspect(
    input: Parameters<ProspectIntelligenceProvider["analyzeProspect"]>[0],
  ) {
    return {
      opportunityScore: 70,
      confidence: 0.8,
      shouldContact: true,
      verifiedFacts: input.auditFacts.slice(0, 5),
      inferredProblems: ["La experiencia digital podría mejorarse."],
      uncertainties: ["Requiere revisión humana antes del contacto."],
      recommendedOffer: input.availableOffer,
      contactAngle: "Comenzar por los hechos técnicos observados.",
      summary: `${input.businessName} presenta una oportunidad basada en su auditoría.`,
    };
  }
  async generateProposal(
    input: Parameters<ProspectIntelligenceProvider["generateProposal"]>[0],
  ) {
    return {
      headline: `Propuesta digital para ${input.businessName}`,
      problemStatement: input.verifiedFacts[0],
      valueProposition: input.availableOffer,
      includedItems: ["Diseño y desarrollo", "Revisión antes de publicar"],
      deliveryTime: "7 días hábiles",
      callToAction: "Revisemos juntos este borrador.",
      emailSubject: `Propuesta para ${input.businessName}`,
      emailBody: `Hola, preparé una propuesta basada en hechos públicos del sitio de ${input.businessName}.`,
      whatsappMessage: `Hola. Preparé una propuesta para ${input.businessName} basada en su sitio público.`,
    };
  }
}
