import type { CommercialStatus, Prospect, WebsiteStatus } from "./models";

export type ContactChannel =
  "whatsapp" | "correo" | "telefono" | "sin-contacto";

export const websiteStatusLabels: Record<WebsiteStatus, string> = {
  "sin-sitio": "Sin web",
  desactualizado: "Web antigua",
  "solo-redes": "Solo Instagram",
  basico: "Web básica",
  optimizado: "Optimizada",
};

export const commercialStatusLabels: Record<CommercialStatus, string> = {
  nuevo: "Nuevo",
  analizando: "Analizando",
  calificado: "Calificado",
  "alta-prioridad": "Alta prioridad",
  "propuesta-lista": "Propuesta lista",
  contactado: "Contactado",
  respondio: "Respondió",
  seguimiento: "Seguimiento",
  negociacion: "Negociación",
  ganado: "Ganado",
  descartado: "Descartado",
};

export function getProspectContactChannel(prospect: Prospect): ContactChannel {
  if (prospect.publicWhatsapp) return "whatsapp";
  if (prospect.publicEmail) return "correo";
  if (prospect.publicPhone) return "telefono";
  return "sin-contacto";
}

export const contactChannelLabels: Record<ContactChannel, string> = {
  whatsapp: "WhatsApp",
  correo: "Correo",
  telefono: "Teléfono",
  "sin-contacto": "Sin contacto",
};
