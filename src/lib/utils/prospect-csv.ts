import type { Prospect } from "@/lib/domain";
import {
  commercialStatusLabels,
  contactChannelLabels,
  getProspectContactChannel,
  websiteStatusLabels,
} from "@/lib/domain/prospect-presentation";

function escapeCsv(value: string | number | null) {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function createProspectsCsv(prospects: Prospect[]) {
  const rows = prospects.map((prospect) => [
    prospect.businessName,
    prospect.niche,
    prospect.location,
    websiteStatusLabels[prospect.websiteStatus],
    contactChannelLabels[getProspectContactChannel(prospect)],
    prospect.publicEmail,
    prospect.publicPhone,
    prospect.publicWhatsapp,
    prospect.contactSourceUrl,
    prospect.opportunityScore,
    commercialStatusLabels[prospect.commercialStatus],
  ]);
  const headers = [
    "Negocio",
    "Nicho",
    "Ubicación",
    "Estado web",
    "Canal",
    "Correo público",
    "Teléfono público",
    "WhatsApp público",
    "URL de origen",
    "Puntaje",
    "Estado comercial",
  ];

  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");
}

export function downloadProspectsCsv(prospects: Prospect[]) {
  const csv = createProspectsCsv(prospects);
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "prospectos-visibles.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
