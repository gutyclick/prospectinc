import { describe, expect, it } from "vitest";
import type OpenAI from "openai";
import { OpenAIProspectIntelligenceProvider } from "./openai-prospect-intelligence-provider";

const input = {
  businessName: "Negocio",
  niche: "Servicios",
  city: "Panamá",
  auditFacts: ["El sitio usa HTTPS."],
  verifiedContacts: [],
  allowedMetrics: {},
  availableOffer: "Web básica",
};
const valid = {
  opportunityScore: 70,
  confidence: 0.8,
  shouldContact: true,
  verifiedFacts: input.auditFacts,
  inferredProblems: [],
  uncertainties: [],
  recommendedOffer: "Web básica",
  contactAngle: "Hechos técnicos",
  summary: "Oportunidad revisable.",
};
const client = (result: unknown, failure?: unknown) =>
  ({
    responses: {
      parse: async () => {
        if (failure) throw failure;
        return result;
      },
    },
  }) as unknown as OpenAI;

describe("adaptador OpenAI Responses API", () => {
  it("acepta una salida válida", async () => {
    const provider = new OpenAIProspectIntelligenceProvider({
      model: "test-model",
      client: client({
        output_parsed: valid,
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
    expect((await provider.analyzeProspect(input)).opportunityScore).toBe(70);
    expect(provider.getLastUsage()).toMatchObject({
      inputTokens: 10,
      outputTokens: 20,
    });
  });
  it("maneja salida inválida y refusal", async () => {
    await expect(
      new OpenAIProspectIntelligenceProvider({
        model: "test",
        client: client({ output_parsed: { opportunityScore: 999 } }),
      }).analyzeProspect(input),
    ).rejects.toMatchObject({ code: "invalid-output" });
    await expect(
      new OpenAIProspectIntelligenceProvider({
        model: "test",
        client: client({ output_parsed: null }),
      }).analyzeProspect(input),
    ).rejects.toMatchObject({ code: "refusal" });
  });
  it("clasifica rate limit y timeout", async () => {
    await expect(
      new OpenAIProspectIntelligenceProvider({
        model: "test",
        client: client(null, { status: 429 }),
      }).analyzeProspect(input),
    ).rejects.toMatchObject({ code: "rate-limit" });
    await expect(
      new OpenAIProspectIntelligenceProvider({
        model: "test",
        client: client(
          null,
          Object.assign(new Error("timeout"), { name: "TimeoutError" }),
        ),
      }).analyzeProspect(input),
    ).rejects.toMatchObject({ code: "timeout" });
  });
});
