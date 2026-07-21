import { createHash } from "node:crypto";

import { calculateHybridOpportunityScore } from "@/lib/domain/opportunity-scoring";
import type { WebsiteAuditResult } from "@/lib/domain/website-audit";
import {
  IntelligenceProviderError,
  prospectAnalysisInputSchema,
  prospectAnalysisSchema,
  type ProspectAnalysis,
  type ProspectAnalysisInput,
  type ProspectIntelligenceProvider,
} from "./prospect-intelligence";

export const PROSPECT_PROMPT_VERSION = "prospect-analysis-v1";

export type AnalysisContext = {
  prospectId: string;
  commercialStatus: string;
  input: ProspectAnalysisInput;
  websiteStatus: WebsiteAuditResult;
  hasServicesContent: boolean;
  hasBooking: boolean;
};

export type StoredAnalysis = {
  output: ProspectAnalysis;
  hash: string;
  cached: boolean;
};

export interface ProspectIntelligenceStore {
  findByHash(
    prospectId: string,
    hash: string,
  ): Promise<ProspectAnalysis | null>;
  countToday(): Promise<number>;
  save(input: {
    prospectId: string;
    hash: string;
    output: ProspectAnalysis;
    model: string;
    inputTokens: number | null;
    outputTokens: number | null;
  }): Promise<void>;
  updateProspect(input: {
    prospectId: string;
    score: number;
    analysis: ProspectAnalysis;
  }): Promise<void>;
  registerActivity(prospectId: string, description: string): Promise<void>;
}

export function hashProspectAnalysisInput(input: ProspectAnalysisInput) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function assertGroundedAnalysis(
  input: ProspectAnalysisInput,
  output: ProspectAnalysis,
) {
  const allowed = new Set(
    input.auditFacts.map((fact) => fact.trim().toLocaleLowerCase("es")),
  );
  const invented = output.verifiedFacts.filter(
    (fact) => !allowed.has(fact.trim().toLocaleLowerCase("es")),
  );
  if (invented.length > 0)
    throw new IntelligenceProviderError(
      "La respuesta intentó presentar información no verificada como hecho.",
      "invalid-output",
    );
  return prospectAnalysisSchema.parse(output);
}

export class ProspectIntelligenceService {
  constructor(
    private readonly provider: ProspectIntelligenceProvider,
    private readonly store: ProspectIntelligenceStore,
    private readonly dailyLimit = 50,
  ) {}

  async analyze(
    context: AnalysisContext,
    force = false,
  ): Promise<StoredAnalysis & { finalScore: number }> {
    if (context.commercialStatus === "descartado")
      throw new IntelligenceProviderError(
        "No se analizan prospectos descartados.",
        "provider",
      );
    const input = prospectAnalysisInputSchema.parse(context.input);
    const hash = hashProspectAnalysisInput(input);
    if (!force) {
      const existing = await this.store.findByHash(context.prospectId, hash);
      if (existing)
        return {
          output: existing,
          hash,
          cached: true,
          finalScore: this.score(context, existing),
        };
    }
    if ((await this.store.countToday()) >= this.dailyLimit)
      throw new IntelligenceProviderError(
        "Se alcanzó el límite diario de análisis con IA.",
        "rate-limit",
      );
    const output = assertGroundedAnalysis(
      input,
      await this.provider.analyzeProspect(input),
    );
    const usage = this.provider.getLastUsage?.();
    const finalScore = this.score(context, output);
    await this.store.save({
      prospectId: context.prospectId,
      hash,
      output,
      model: usage?.model ?? "fake",
      inputTokens: usage?.inputTokens ?? null,
      outputTokens: usage?.outputTokens ?? null,
    });
    await this.store.updateProspect({
      prospectId: context.prospectId,
      score: finalScore,
      analysis: output,
    });
    await this.store.registerActivity(
      context.prospectId,
      "Análisis de oportunidad con IA completado.",
    );
    return { output, hash, cached: false, finalScore };
  }

  private score(context: AnalysisContext, output: ProspectAnalysis) {
    return calculateHybridOpportunityScore({
      websiteStatus: context.websiteStatus,
      verifiedContactCount: context.input.verifiedContacts.length,
      hasServicesContent: context.hasServicesContent,
      hasBooking: context.hasBooking,
      nicheKnown: context.input.niche.trim().length > 0,
      aiScore: output.opportunityScore,
      aiConfidence: output.confidence,
    });
  }
}
