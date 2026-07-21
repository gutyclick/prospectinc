import "server-only";

import { requireOwner } from "@/lib/auth/require-owner";
import {
  buildMailtoLink,
  buildWhatsappLink,
  publicEmailSchema,
  internationalWhatsappSchema,
  type PreparedContact,
} from "@/lib/domain/manual-contact";
import { RepositoryError } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";

type GeneratedContent = {
  emailSubject?: string;
  emailBody?: string;
  whatsappMessage?: string;
};

function parseGeneratedContent(value: unknown): GeneratedContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  return {
    emailSubject:
      typeof record.emailSubject === "string" ? record.emailSubject : undefined,
    emailBody:
      typeof record.emailBody === "string" ? record.emailBody : undefined,
    whatsappMessage:
      typeof record.whatsappMessage === "string"
        ? record.whatsappMessage
        : undefined,
  };
}

export async function prepareManualContact(
  proposalId: string,
  channel: "correo" | "whatsapp",
): Promise<PreparedContact> {
  const [client, owner] = await Promise.all([createClient(), requireOwner()]);
  const { data: proposal } = await client
    .from("proposals")
    .select("id,prospect_id,status,summary,service,generated_content")
    .eq("id", proposalId)
    .single();
  if (!proposal || !["lista", "enviada"].includes(proposal.status))
    throw new RepositoryError(
      "La propuesta debe revisarse y marcarse como lista antes de contactar.",
      "validation",
    );
  const { data: prospect } = await client
    .from("prospects")
    .select("business_name")
    .eq("id", proposal.prospect_id)
    .single();
  const contactType = channel === "correo" ? "email" : "whatsapp";
  const { data: contact } = await client
    .from("contact_points")
    .select(
      "id,value,normalized_value,source_url,do_not_contact,verification_status,is_public",
    )
    .eq("prospect_id", proposal.prospect_id)
    .eq("type", contactType)
    .eq("owner_id", owner.id)
    .order("last_verified_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (
    !contact?.source_url ||
    !contact.is_public ||
    contact.do_not_contact ||
    contact.verification_status !== "verificado"
  )
    throw new RepositoryError(
      `No existe un ${contactType === "email" ? "correo" : "WhatsApp"} público, verificado y con fuente.`,
      "validation",
    );
  const { count: excluded } = await client
    .from("exclusion_list")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", owner.id)
    .eq("contact_type", contactType)
    .eq("normalized_value", contact.normalized_value);
  if ((excluded ?? 0) > 0)
    throw new RepositoryError(
      "El contacto está en la lista de exclusión.",
      "validation",
    );

  const parsedRecipient =
    channel === "correo"
      ? publicEmailSchema.safeParse(contact.value)
      : internationalWhatsappSchema.safeParse(contact.normalized_value);
  if (!parsedRecipient.success)
    throw new RepositoryError(
      channel === "correo"
        ? "El correo público no tiene un formato válido."
        : "El WhatsApp no tiene formato internacional y no se añadirá un código de país automáticamente.",
      "validation",
    );
  const recipient = parsedRecipient.data;
  const generated = parseGeneratedContent(proposal.generated_content);
  const businessName = prospect?.business_name ?? "su negocio";
  const subject =
    channel === "correo"
      ? (generated.emailSubject ?? `Propuesta para ${businessName}`)
      : "";
  const body =
    channel === "correo"
      ? (generated.emailBody ?? proposal.summary)
      : (generated.whatsappMessage ??
        `Hola. Preparé una propuesta individual para ${businessName} sobre ${proposal.service}.`);
  const { data: conversations } = await client
    .from("conversations")
    .select("id")
    .eq("prospect_id", proposal.prospect_id)
    .eq("channel", channel);
  let recentContact = false;
  if ((conversations ?? []).length > 0) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await client
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in(
        "conversation_id",
        conversations!.map((item) => item.id),
      )
      .eq("direction", "saliente")
      .gte("occurred_at", since);
    recentContact = (count ?? 0) > 0;
  }
  return {
    proposalId,
    contactPointId: contact.id,
    channel,
    recipient,
    sourceUrl: contact.source_url,
    subject,
    body,
    href:
      channel === "correo"
        ? buildMailtoLink(recipient, subject, body)
        : buildWhatsappLink(recipient, body),
    recentContact,
  };
}
