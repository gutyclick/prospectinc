import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

import {
  assertSafeGeneratedProposal,
  generatedProposalSchema,
  IntelligenceProviderError,
  prospectAnalysisSchema,
  type IntelligenceUsage,
  type GeneratedProposal,
  type ProspectAnalysis,
  type ProspectIntelligenceProvider,
} from "./prospect-intelligence";

const POLICY = `Trabaja únicamente con el paquete factual recibido. No inventes datos ni nombres de propietarios. No afirmes que el negocio pierde dinero, que una web garantiza ventas ni que hablaste con el negocio. No uses lenguaje manipulador. No presentes inferencias como hechos ni menciones problemas ausentes de la auditoría. Separa hechos, inferencias, incertidumbres y recomendaciones. Todo contenido será revisado por una persona antes de usarse.`;

export class OpenAIProspectIntelligenceProvider implements ProspectIntelligenceProvider {
  private readonly client: OpenAI;
  private readonly model: string;
  private lastUsage: IntelligenceUsage | null = null;

  constructor(
    options: {
      apiKey?: string;
      model?: string;
      timeoutMs?: number;
      client?: OpenAI;
    } = {},
  ) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    const model = options.model ?? process.env.OPENAI_MODEL;
    if ((!apiKey && !options.client) || !model)
      throw new IntelligenceProviderError(
        "OpenAI no está configurado.",
        "configuration",
      );
    this.model = model;
    this.client =
      options.client ??
      new OpenAI({
        apiKey,
        timeout: options.timeoutMs ?? 30_000,
        maxRetries: 2,
      });
  }

  getLastUsage() {
    return this.lastUsage;
  }

  async analyzeProspect(
    input: Parameters<ProspectIntelligenceProvider["analyzeProspect"]>[0],
  ): Promise<ProspectAnalysis> {
    return this.request(
      input,
      prospectAnalysisSchema,
      "prospect_analysis",
      "Analiza la oportunidad comercial sin alterar los hechos.",
    );
  }

  async generateProposal(
    input: Parameters<ProspectIntelligenceProvider["generateProposal"]>[0],
  ): Promise<GeneratedProposal> {
    return assertSafeGeneratedProposal(
      await this.request(
        input,
        generatedProposalSchema,
        "generated_proposal",
        "Redacta un borrador editable usando exclusivamente hechos verificados. No lo envíes.",
      ),
    );
  }

  private async request<T>(
    input: unknown,
    schema: z.ZodType<T>,
    name: string,
    purpose: string,
  ): Promise<T> {
    try {
      const response = await this.client.responses.parse({
        model: this.model,
        instructions: `${POLICY}\n${purpose}`,
        input: JSON.stringify(input),
        text: { format: zodTextFormat(schema, name) },
      });
      this.lastUsage = {
        model: this.model,
        inputTokens: response.usage?.input_tokens ?? null,
        outputTokens: response.usage?.output_tokens ?? null,
      };
      if (!response.output_parsed)
        throw new IntelligenceProviderError(
          "El modelo rechazó o no produjo una respuesta utilizable.",
          "refusal",
        );
      const parsed = schema.safeParse(response.output_parsed);
      if (!parsed.success)
        throw new IntelligenceProviderError(
          "OpenAI devolvió una salida estructurada inválida.",
          "invalid-output",
        );
      return parsed.data;
    } catch (error) {
      if (error instanceof IntelligenceProviderError) throw error;
      if (
        error instanceof OpenAI.RateLimitError ||
        (typeof error === "object" &&
          error !== null &&
          "status" in error &&
          error.status === 429)
      )
        throw new IntelligenceProviderError(
          "Se alcanzó temporalmente el límite de OpenAI.",
          "rate-limit",
        );
      if (
        error instanceof OpenAI.APIConnectionTimeoutError ||
        (error instanceof Error &&
          ["AbortError", "TimeoutError"].includes(error.name))
      )
        throw new IntelligenceProviderError(
          "OpenAI tardó demasiado en responder.",
          "timeout",
        );
      if (
        error instanceof OpenAI.APIError &&
        error.status &&
        error.status < 500
      )
        throw new IntelligenceProviderError(
          "OpenAI rechazó la solicitud.",
          "provider",
        );
      throw new IntelligenceProviderError(
        "No se pudo completar el análisis con OpenAI.",
        "provider",
      );
    }
  }
}
