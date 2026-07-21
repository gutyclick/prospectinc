import { z } from "zod";

const shortText = z.string().trim().min(1).max(800);
export const prospectAnalysisSchema = z
  .object({
    opportunityScore: z.number().int().min(0).max(100),
    confidence: z.number().min(0).max(1),
    shouldContact: z.boolean(),
    verifiedFacts: z.array(shortText).max(20),
    inferredProblems: z.array(shortText).max(12),
    uncertainties: z.array(shortText).max(12),
    recommendedOffer: shortText,
    contactAngle: shortText,
    summary: shortText,
  })
  .strict();

export const generatedProposalSchema = z
  .object({
    headline: shortText,
    problemStatement: shortText,
    valueProposition: shortText,
    includedItems: z.array(shortText).min(1).max(12),
    deliveryTime: shortText,
    callToAction: shortText,
    emailSubject: shortText,
    emailBody: z.string().trim().min(1).max(5000),
    whatsappMessage: z.string().trim().min(1).max(1500),
  })
  .strict();

export const prospectAnalysisInputSchema = z
  .object({
    businessName: shortText,
    niche: shortText,
    city: shortText,
    auditFacts: z.array(shortText).min(1).max(30),
    verifiedContacts: z
      .array(
        z
          .object({
            type: shortText,
            value: shortText,
            sourceUrl: z.string().url(),
          })
          .strict(),
      )
      .max(20),
    allowedMetrics: z.record(z.string(), z.number().finite()).default({}),
    availableOffer: shortText,
  })
  .strict();

export const proposalGenerationInputSchema = z
  .object({
    businessName: shortText,
    niche: shortText,
    city: shortText,
    verifiedFacts: z.array(shortText).min(1).max(30),
    availableOffer: shortText,
  })
  .strict();

export type ProspectAnalysis = z.infer<typeof prospectAnalysisSchema>;
export type GeneratedProposal = z.infer<typeof generatedProposalSchema>;
export type ProspectAnalysisInput = z.infer<typeof prospectAnalysisInputSchema>;
export type ProposalGenerationInput = z.infer<
  typeof proposalGenerationInputSchema
>;

export type IntelligenceUsage = {
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
};

export interface ProspectIntelligenceProvider {
  analyzeProspect(input: ProspectAnalysisInput): Promise<ProspectAnalysis>;
  generateProposal(input: ProposalGenerationInput): Promise<GeneratedProposal>;
  getLastUsage?(): IntelligenceUsage | null;
}

export class IntelligenceProviderError extends Error {
  constructor(
    message: string,
    readonly code:
      | "invalid-output"
      | "refusal"
      | "timeout"
      | "rate-limit"
      | "configuration"
      | "provider",
  ) {
    super(message);
    this.name = "IntelligenceProviderError";
  }
}

export function assertSafeGeneratedProposal(proposal: GeneratedProposal) {
  const text = Object.values(proposal).flat().join(" ");
  if (
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text) ||
    /(?:\+?\d[\d\s().-]{7,}\d)/.test(text)
  )
    throw new IntelligenceProviderError(
      "La propuesta intentó introducir datos de contacto no verificados.",
      "invalid-output",
    );
  if (
    /garantiza(?:mos)? ventas|pierde dinero|hablamos con (?:el|la)|propietari[oa] se llama|dueñ[oa] se llama/i.test(
      text,
    )
  )
    throw new IntelligenceProviderError(
      "La propuesta contiene una afirmación prohibida o no verificada.",
      "invalid-output",
    );
  return proposal;
}
