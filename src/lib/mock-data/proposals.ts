import { z } from "zod";

import { proposalSchema } from "@/lib/validation";

export const mockProposals = z.array(proposalSchema).parse([
  {
    id: "proposal-clinica-dental-nova",
    prospectId: "prospect-clinica-dental-nova",
    service: "Sitio web + citas",
    price: 690,
    currency: "USD",
    status: "borrador",
    summary:
      "Sitio informativo orientado a captar pacientes y organizar solicitudes de citas.",
    includedItems: [
      "Diseño responsive de cinco secciones",
      "Formulario de solicitud de cita",
      "Integración manual con WhatsApp",
      "Optimización técnica inicial",
    ],
    recommendedAngle:
      "Destacar reputación local, especialidades y facilidad para reservar.",
    createdAt: "2026-07-18T15:45:00.000Z",
    updatedAt: "2026-07-18T18:30:00.000Z",
  },
  {
    id: "proposal-taller-automax",
    prospectId: "prospect-taller-automax",
    service: "Renovación web + cotizaciones",
    price: 520,
    currency: "USD",
    status: "lista",
    summary:
      "Renovación móvil para presentar servicios y recibir solicitudes de cotización.",
    includedItems: [
      "Rediseño de páginas existentes",
      "Catálogo de servicios",
      "Formulario de cotización",
    ],
    recommendedAngle:
      "Reducir llamadas repetitivas y facilitar cotizaciones desde el teléfono.",
    createdAt: "2026-07-17T14:10:00.000Z",
    updatedAt: "2026-07-18T17:00:00.000Z",
  },
  {
    id: "proposal-restaurante-la-toscana",
    prospectId: "prospect-restaurante-la-toscana",
    service: "Web + menú + reservas",
    price: 840,
    currency: "USD",
    status: "enviada",
    summary: "Canal propio para menú, reservas y descubrimiento local.",
    includedItems: [
      "Menú administrable",
      "Formulario de reservas",
      "Mapa y horarios",
    ],
    recommendedAngle:
      "Convertir el interés de redes sociales en reservas directas.",
    createdAt: "2026-07-16T19:00:00.000Z",
    updatedAt: "2026-07-18T23:00:00.000Z",
  },
  {
    id: "proposal-abogados-rivera",
    prospectId: "prospect-abogados-rivera",
    service: "Sitio corporativo",
    price: 1200,
    currency: "USD",
    status: "negociacion",
    summary:
      "Sitio profesional para explicar áreas de práctica y captar consultas calificadas.",
    includedItems: [
      "Arquitectura de contenidos",
      "Perfiles profesionales",
      "Formulario seguro",
    ],
    recommendedAngle:
      "Transmitir especialización y confianza antes de la primera consulta.",
    createdAt: "2026-07-15T16:00:00.000Z",
    updatedAt: "2026-07-18T20:20:00.000Z",
  },
  {
    id: "proposal-spa-aura",
    prospectId: "prospect-spa-aura",
    service: "Reservas + paquetes",
    price: 760,
    currency: "USD",
    status: "aceptada",
    summary:
      "Experiencia renovada para descubrir tratamientos y solicitar reservas.",
    includedItems: [
      "Catálogo de tratamientos",
      "Paquetes promocionales",
      "Solicitud de reserva",
    ],
    recommendedAngle:
      "Facilitar la decisión con servicios claros, disponibilidad y confianza.",
    createdAt: "2026-07-14T15:30:00.000Z",
    updatedAt: "2026-07-18T22:00:00.000Z",
  },
]);
