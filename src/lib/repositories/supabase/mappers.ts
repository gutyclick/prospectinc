import type {
  Activity,
  Conversation,
  Proposal,
  Prospect,
  Search,
} from "@/lib/domain";
import {
  activitySchema,
  conversationSchema,
  proposalSchema,
  prospectSchema,
  searchSchema,
} from "@/lib/validation";
import type { Database } from "@/types/database.types";

type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export function mapSearch(row: Row<"searches">): Search {
  return searchSchema.parse({
    id: row.id,
    query: row.query,
    location: row.location,
    country: row.country,
    resultLimit: row.result_limit,
    sources: row.sources,
    status: row.status === "pendiente" ? "analizando" : row.status,
    resultsCount: row.results_count,
    opportunitiesCount: row.opportunities_count,
    insertedCount: row.inserted_count,
    deduplicatedCount: row.deduplicated_count,
    providerCallCount: row.provider_call_count,
    provisionalWebsiteCount: row.provisional_website_count,
    noWebsiteCount: row.no_website_count,
    progress: row.progress,
    processingStage: row.processing_stage,
    externalRunId: row.external_run_id,
    retryCount: row.retry_count,
    errorMessage: row.error_message,
    createdAt: row.created_at,
  });
}

export function mapProspect(
  row: Row<"prospects">,
  contacts: Row<"contact_points">[],
): Prospect {
  const byType = (type: Row<"contact_points">["type"]) =>
    contacts.find((contact) => contact.type === type);
  const email = byType("email");
  const phone = byType("phone");
  const whatsapp = byType("whatsapp");
  const source =
    email?.source_url ?? phone?.source_url ?? whatsapp?.source_url ?? null;
  return prospectSchema.parse({
    id: row.id,
    searchId: row.search_id,
    businessName: row.business_name,
    niche: row.niche,
    location:
      (row.formatted_address ??
        [row.city, row.country].filter(Boolean).join(", ")) ||
      "Ubicación no indicada",
    websiteUrl: row.website_url,
    websiteStatus:
      row.website_status === "desconocido" ? "basico" : row.website_status,
    publicEmail: email?.value ?? null,
    publicPhone: phone?.value ?? null,
    publicWhatsapp: whatsapp?.value ?? null,
    contactSourceUrl: source,
    opportunityScore: row.opportunity_score,
    commercialStatus: row.commercial_status,
    recommendedOffer:
      row.recommended_offer ?? "Auditoría digital y propuesta personalizada",
    aiSummary: row.ai_summary ?? "Pendiente de análisis.",
    detectedOpportunities:
      row.detected_opportunities.length > 0
        ? row.detected_opportunities
        : ["Revisar presencia digital y oportunidades comerciales"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function mapProposal(row: Row<"proposals">): Proposal {
  return proposalSchema.parse({
    id: row.id,
    prospectId: row.prospect_id,
    service: row.service,
    price: row.price,
    currency: row.currency,
    status: row.status,
    summary: row.summary,
    includedItems: row.included_items,
    recommendedAngle: row.recommended_angle,
    deliveryTime: row.delivery_time,
    callToAction: row.call_to_action,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function mapConversation(
  row: Row<"conversations">,
  messages: Row<"messages">[],
): Conversation {
  const status =
    row.status === "negociacion"
      ? "respondio"
      : row.status === "ganada"
        ? "cerrada"
        : row.status;
  return conversationSchema.parse({
    id: row.id,
    prospectId: row.prospect_id,
    channel: row.channel,
    status,
    messages: messages.map((message) => ({
      id: message.id,
      direction: message.direction,
      body: message.body,
      createdAt: message.occurred_at,
    })),
    lastActivityAt: row.last_activity_at,
    nextAction: row.next_action,
    followUpAt: row.follow_up_at,
  });
}

export function mapActivity(row: Row<"activities">): Activity {
  const allowed = [
    "busqueda",
    "prospecto",
    "propuesta",
    "contacto",
    "respuesta",
    "seguimiento",
  ] as const;
  const type = allowed.includes(row.type as (typeof allowed)[number])
    ? row.type
    : "prospecto";
  return activitySchema.parse({
    id: row.id,
    type,
    description: row.description,
    createdAt: row.created_at,
  });
}
