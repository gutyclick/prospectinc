import { z } from "zod";

export const publicEmailSchema = z.string().trim().email();
export const internationalWhatsappSchema = z
  .string()
  .trim()
  .regex(
    /^\+[1-9]\d{7,14}$/,
    "El WhatsApp debe incluir +, código de país y entre 8 y 15 dígitos.",
  );

export function buildMailtoLink(
  recipient: string,
  subject: string,
  body: string,
) {
  const email = publicEmailSchema.parse(recipient);
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildWhatsappLink(number: string, message: string) {
  const validated = internationalWhatsappSchema.parse(number);
  return `https://wa.me/${validated.slice(1)}?text=${encodeURIComponent(message)}`;
}

export const recordManualContactSchema = z
  .object({
    proposalId: z.string().uuid(),
    contactPointId: z.string().uuid(),
    channel: z.enum(["correo", "whatsapp"]),
    subject: z.string().trim().max(300),
    body: z.string().trim().min(1).max(10_000),
    allowRepeat: z.boolean().default(false),
    followUpAt: z.iso.datetime({ offset: true }).nullable().default(null),
  })
  .strict();

export type PreparedContact = {
  proposalId: string;
  contactPointId: string;
  channel: "correo" | "whatsapp";
  recipient: string;
  sourceUrl: string;
  subject: string;
  body: string;
  href: string;
  recentContact: boolean;
};

export function assertManualContactPolicy(input: {
  proposalReviewed: boolean;
  hasSource: boolean;
  isExcluded: boolean;
  sentToday: number;
  dailyLimit: number;
  recentContact: boolean;
  allowRepeat: boolean;
}) {
  if (!input.proposalReviewed) throw new Error("La propuesta no fue revisada.");
  if (!input.hasSource) throw new Error("El contacto no tiene fuente.");
  if (input.isExcluded) throw new Error("El contacto está excluido.");
  if (input.sentToday >= input.dailyLimit)
    throw new Error("Se alcanzó el límite diario.");
  if (input.recentContact && !input.allowRepeat)
    throw new Error("Existe un contacto reciente.");
}
