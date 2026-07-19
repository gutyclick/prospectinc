import type { Proposal, ProposalStatus, Prospect } from "./models";
import type { ProposalTemplate } from "@/lib/validation";

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  borrador: "Borrador",
  lista: "Lista para enviar",
  enviada: "Enviada",
  aceptada: "Aceptada",
  negociacion: "Respondida",
  descartada: "Descartada",
};

export const proposalTemplates: Array<{
  id: ProposalTemplate;
  name: string;
  service: string;
  price: number;
  deliveryTime: string;
}> = [
  {
    id: "web-basica",
    name: "Web básica",
    service: "Sitio web básico",
    price: 490,
    deliveryTime: "7 días hábiles",
  },
  {
    id: "landing-whatsapp",
    name: "Landing + WhatsApp",
    service: "Landing + WhatsApp",
    price: 520,
    deliveryTime: "5 días hábiles",
  },
  {
    id: "web-corporativa",
    name: "Web corporativa",
    service: "Sitio web corporativo",
    price: 1200,
    deliveryTime: "15 días hábiles",
  },
  {
    id: "reservas-online",
    name: "Reservas online",
    service: "Web con reservas online",
    price: 840,
    deliveryTime: "10 días hábiles",
  },
];

export function generateProposalContent(
  prospect: Prospect,
  template: ProposalTemplate,
) {
  const selectedTemplate =
    proposalTemplates.find((item) => item.id === template) ??
    proposalTemplates[0];
  return {
    service: selectedTemplate.service,
    price: selectedTemplate.price,
    deliveryTime: selectedTemplate.deliveryTime,
    summary: `Propuesta para ${prospect.businessName}, enfocada en mejorar su presencia digital en el sector ${prospect.niche.toLocaleLowerCase("es")} y convertir más consultas en oportunidades comerciales.`,
    includedItems: [
      selectedTemplate.service,
      ...prospect.detectedOpportunities.slice(0, 3),
      "Diseño responsive y optimización móvil",
    ].join("\n"),
    callToAction:
      "Agenda una llamada de 20 minutos para revisar el alcance y definir la fecha de inicio.",
  };
}

export function calculateProposalMetrics(proposals: Proposal[]) {
  return {
    total: proposals.length,
    ready: proposals.filter((proposal) => proposal.status === "lista").length,
    accepted: proposals.filter((proposal) => proposal.status === "aceptada")
      .length,
    estimatedValue: proposals
      .filter(
        (proposal) => !["aceptada", "descartada"].includes(proposal.status),
      )
      .reduce((total, proposal) => total + proposal.price, 0),
  };
}
