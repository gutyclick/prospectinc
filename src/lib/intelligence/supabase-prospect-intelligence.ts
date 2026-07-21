import "server-only";

import { requireOwner } from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";
import type { ProspectAnalysis } from "./prospect-intelligence";
import {
  generatedProposalSchema,
  proposalGenerationInputSchema,
  prospectAnalysisSchema,
} from "./prospect-intelligence";
import { OpenAIProspectIntelligenceProvider } from "./openai-prospect-intelligence-provider";
import {
  PROSPECT_PROMPT_VERSION,
  ProspectIntelligenceService,
  type ProspectIntelligenceStore,
} from "./prospect-intelligence-service";
import type { WebsiteAuditResult } from "@/lib/domain/website-audit";
import { createHash } from "node:crypto";
import { mapProposal } from "@/lib/repositories/supabase/mappers";

function factualSentences(audit: {
  uses_https: boolean | null;
  has_mobile_viewport: boolean | null;
  has_contact_form: boolean | null;
  has_whatsapp: boolean | null;
  has_booking: boolean | null;
  has_services_content: boolean | null;
  has_meta_description: boolean | null;
  broken_links_count: number | null;
}) {
  return [
    audit.uses_https === true
      ? "El sitio usa HTTPS."
      : audit.uses_https === false
        ? "El sitio no usa HTTPS."
        : null,
    audit.has_mobile_viewport === true
      ? "El sitio declara viewport móvil."
      : audit.has_mobile_viewport === false
        ? "El sitio no declara viewport móvil."
        : null,
    audit.has_contact_form === true
      ? "El sitio muestra un formulario de contacto."
      : null,
    audit.has_whatsapp === true
      ? "El sitio muestra un enlace oficial de WhatsApp."
      : null,
    audit.has_booking === true
      ? "El sitio muestra una opción de reservas o citas."
      : null,
    audit.has_services_content === true
      ? "El sitio muestra contenido de servicios."
      : null,
    audit.has_meta_description === false
      ? "El sitio no tiene meta descripción."
      : audit.has_meta_description === true
        ? "El sitio tiene meta descripción."
        : null,
    typeof audit.broken_links_count === "number"
      ? `La muestra encontró ${audit.broken_links_count} enlaces internos rotos.`
      : null,
  ].filter((fact): fact is string => Boolean(fact));
}

export async function analyzeProspectWithOpenAI(
  prospectId: string,
  force: boolean,
) {
  const [client, owner] = await Promise.all([createClient(), requireOwner()]);
  const [{ data: prospect }, { data: audit }, { data: contacts }] =
    await Promise.all([
      client
        .from("prospects")
        .select(
          "id,business_name,niche,city,commercial_status,recommended_offer",
        )
        .eq("id", prospectId)
        .single(),
      client
        .from("website_audits")
        .select(
          "result_status,uses_https,has_mobile_viewport,has_contact_form,has_whatsapp,has_booking,has_services_content,has_meta_description,broken_links_count",
        )
        .eq("prospect_id", prospectId)
        .eq("status", "completada")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      client
        .from("contact_points")
        .select("type,value,source_url")
        .eq("prospect_id", prospectId)
        .eq("verification_status", "verificado")
        .eq("do_not_contact", false),
    ]);
  if (!prospect) throw new Error("El prospecto no existe.");
  if (!audit?.result_status)
    throw new Error("Primero completa una auditoría web del prospecto.");
  const store: ProspectIntelligenceStore = {
    async findByHash(id, hash) {
      const { data } = await client
        .from("ai_analyses")
        .select("structured_output")
        .eq("prospect_id", id)
        .eq("analysis_type", "prospect_opportunity")
        .eq("prompt_version", PROSPECT_PROMPT_VERSION)
        .eq("input_hash", hash)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const parsed = prospectAnalysisSchema.safeParse(data?.structured_output);
      return parsed.success ? parsed.data : null;
    },
    async countToday() {
      const start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      const { count } = await client
        .from("ai_analyses")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", owner.id)
        .gte("created_at", start.toISOString());
      return count ?? 0;
    },
    async save(value) {
      const { error } = await client.from("ai_analyses").insert({
        owner_id: owner.id,
        prospect_id: value.prospectId,
        analysis_type: "prospect_opportunity",
        model: value.model,
        prompt_version: PROSPECT_PROMPT_VERSION,
        input_hash: value.hash,
        structured_output: value.output,
        input_tokens: value.inputTokens,
        output_tokens: value.outputTokens,
      });
      if (error) throw new Error("No se pudo guardar el análisis.");
    },
    async updateProspect(value) {
      await client
        .from("prospects")
        .update({
          opportunity_score: value.score,
          recommended_offer: value.analysis.recommendedOffer,
          ai_summary: value.analysis.summary,
          detected_opportunities: value.analysis.inferredProblems,
        })
        .eq("id", value.prospectId);
    },
    async registerActivity(id, description) {
      await client.from("activities").insert({
        owner_id: owner.id,
        prospect_id: id,
        type: "prospecto",
        description,
        metadata: {
          source: "openai",
          promptVersion: PROSPECT_PROMPT_VERSION,
        },
      });
    },
  };
  const input = {
    businessName: prospect.business_name,
    niche: prospect.niche,
    city: prospect.city ?? "Ubicación no especificada",
    auditFacts: factualSentences(audit),
    verifiedContacts: (contacts ?? []).map((contact) => ({
      type: contact.type,
      value: contact.value,
      sourceUrl: contact.source_url,
    })),
    allowedMetrics: { brokenLinksCount: audit.broken_links_count ?? 0 },
    availableOffer: prospect.recommended_offer ?? "Auditoría y mejora web",
  };
  return new ProspectIntelligenceService(
    new OpenAIProspectIntelligenceProvider(),
    store,
    Number(process.env.OPENAI_DAILY_ANALYSIS_LIMIT ?? 50),
  ).analyze(
    {
      prospectId,
      commercialStatus: prospect.commercial_status,
      input,
      websiteStatus: audit.result_status as WebsiteAuditResult,
      hasServicesContent: audit.has_services_content ?? false,
      hasBooking: audit.has_booking ?? false,
    },
    force,
  );
}

export type ProspectIntelligenceView = ProspectAnalysis & { createdAt: string };

export async function getLatestProspectIntelligence(prospectIds: string[]) {
  if (prospectIds.length === 0) return {};
  const client = await createClient();
  await requireOwner();
  const { data } = await client
    .from("ai_analyses")
    .select("prospect_id,structured_output,created_at")
    .eq("analysis_type", "prospect_opportunity")
    .in("prospect_id", prospectIds)
    .order("created_at", { ascending: false });
  const result: Record<string, ProspectIntelligenceView> = {};
  for (const row of data ?? []) {
    if (result[row.prospect_id]) continue;
    const parsed = prospectAnalysisSchema.safeParse(row.structured_output);
    if (parsed.success)
      result[row.prospect_id] = { ...parsed.data, createdAt: row.created_at };
  }
  return result;
}

export async function generateProposalWithOpenAI(prospectId: string) {
  const [client, owner] = await Promise.all([createClient(), requireOwner()]);
  const [{ data: prospect }, { data: analysis }] = await Promise.all([
    client
      .from("prospects")
      .select("id,business_name,niche,city,recommended_offer")
      .eq("id", prospectId)
      .single(),
    client
      .from("ai_analyses")
      .select("structured_output")
      .eq("prospect_id", prospectId)
      .eq("analysis_type", "prospect_opportunity")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (!prospect) throw new Error("El prospecto no existe.");
  const prior = prospectAnalysisSchema.safeParse(analysis?.structured_output);
  if (!prior.success) throw new Error("Primero analiza el prospecto con IA.");
  const input = proposalGenerationInputSchema.parse({
    businessName: prospect.business_name,
    niche: prospect.niche,
    city: prospect.city,
    verifiedFacts: prior.data.verifiedFacts,
    availableOffer: prior.data.recommendedOffer || prospect.recommended_offer,
  });
  const hash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  const { data: cached } = await client
    .from("ai_analyses")
    .select("structured_output")
    .eq("prospect_id", prospectId)
    .eq("analysis_type", "proposal_generation")
    .eq("prompt_version", "proposal-generation-v1")
    .eq("input_hash", hash)
    .maybeSingle();
  let generated = generatedProposalSchema.safeParse(cached?.structured_output);
  let usage: ReturnType<OpenAIProspectIntelligenceProvider["getLastUsage"]> =
    null;
  if (!generated.success) {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const { count } = await client
      .from("ai_analyses")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", owner.id)
      .gte("created_at", start.toISOString());
    if ((count ?? 0) >= Number(process.env.OPENAI_DAILY_ANALYSIS_LIMIT ?? 50))
      throw new Error(
        "Se alcanzó el límite diario de inteligencia artificial.",
      );
    const provider = new OpenAIProspectIntelligenceProvider();
    const output = await provider.generateProposal(input);
    generated = generatedProposalSchema.safeParse(output);
    usage = provider.getLastUsage();
    if (!generated.success)
      throw new Error("OpenAI devolvió una propuesta inválida.");
    await client.from("ai_analyses").insert({
      owner_id: owner.id,
      prospect_id: prospectId,
      analysis_type: "proposal_generation",
      model: usage?.model ?? "unknown",
      prompt_version: "proposal-generation-v1",
      input_hash: hash,
      structured_output: generated.data,
      input_tokens: usage?.inputTokens ?? null,
      output_tokens: usage?.outputTokens ?? null,
    });
  }
  const content = generated.data;
  const { data: proposal, error } = await client
    .from("proposals")
    .insert({
      owner_id: owner.id,
      prospect_id: prospectId,
      service: prior.data.recommendedOffer,
      price: 0,
      currency: "USD",
      status: "borrador",
      summary: `${content.headline}\n\n${content.problemStatement}\n\n${content.valueProposition}`,
      included_items: content.includedItems,
      recommended_angle: prior.data.contactAngle,
      delivery_time: content.deliveryTime,
      call_to_action: content.callToAction,
      generated_content: content,
    })
    .select()
    .single();
  if (error || !proposal)
    throw new Error("No se pudo guardar el borrador generado.");
  await client.from("activities").insert({
    owner_id: owner.id,
    prospect_id: prospectId,
    type: "propuesta",
    description:
      "Borrador de propuesta generado con IA; requiere revisión humana.",
    metadata: { proposalId: proposal.id },
  });
  return { proposal: mapProposal(proposal), generated: content };
}
