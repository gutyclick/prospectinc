import { z } from "zod";

import { conversationSchema } from "@/lib/validation";

export const mockConversations = z.array(conversationSchema).parse([
  {
    id: "conversation-clinica-dental-nova",
    prospectId: "prospect-clinica-dental-nova",
    channel: "whatsapp",
    status: "sin-contactar",
    messages: [],
    lastActivityAt: "2026-07-18T18:30:00.000Z",
    nextAction: "Revisar y abrir el mensaje inicial en WhatsApp",
    followUpAt: "2026-07-20T14:00:00.000Z",
  },
  {
    id: "conversation-taller-automax",
    prospectId: "prospect-taller-automax",
    channel: "correo",
    status: "esperando-respuesta",
    messages: [
      {
        id: "message-automax-1",
        direction: "saliente",
        body: "Compartimos un resumen de oportunidades para mejorar su sitio móvil.",
        createdAt: "2026-07-18T17:10:00.000Z",
      },
    ],
    lastActivityAt: "2026-07-18T17:10:00.000Z",
    nextAction: "Confirmar si revisaron la propuesta",
    followUpAt: "2026-07-22T15:00:00.000Z",
  },
  {
    id: "conversation-restaurante-la-toscana",
    prospectId: "prospect-restaurante-la-toscana",
    channel: "whatsapp",
    status: "respondio",
    messages: [
      {
        id: "message-toscana-1",
        direction: "saliente",
        body: "Preparamos una idea para reunir menú y reservas en un sitio propio.",
        createdAt: "2026-07-18T20:00:00.000Z",
      },
      {
        id: "message-toscana-2",
        direction: "entrante",
        body: "Gracias, nos interesa revisar el alcance de las reservas.",
        createdAt: "2026-07-19T00:05:00.000Z",
      },
    ],
    lastActivityAt: "2026-07-19T00:05:00.000Z",
    nextAction: "Responder con detalles del flujo de reservas",
    followUpAt: "2026-07-19T16:00:00.000Z",
  },
  {
    id: "conversation-abogados-rivera",
    prospectId: "prospect-abogados-rivera",
    channel: "correo",
    status: "seguimiento",
    messages: [
      {
        id: "message-rivera-1",
        direction: "saliente",
        body: "Enviamos una propuesta para reorganizar sus áreas de práctica.",
        createdAt: "2026-07-16T18:00:00.000Z",
      },
      {
        id: "message-rivera-2",
        direction: "entrante",
        body: "Nos gustaría conversar sobre el alcance y los tiempos.",
        createdAt: "2026-07-17T19:30:00.000Z",
      },
    ],
    lastActivityAt: "2026-07-17T19:30:00.000Z",
    nextAction: "Preparar opciones de alcance para la conversación",
    followUpAt: "2026-07-21T14:30:00.000Z",
  },
  {
    id: "conversation-spa-aura",
    prospectId: "prospect-spa-aura",
    channel: "correo",
    status: "cerrada",
    messages: [
      {
        id: "message-aura-1",
        direction: "saliente",
        body: "Compartimos la propuesta de reservas y paquetes de bienestar.",
        createdAt: "2026-07-15T14:00:00.000Z",
      },
      {
        id: "message-aura-2",
        direction: "entrante",
        body: "Confirmamos que deseamos avanzar con la propuesta.",
        createdAt: "2026-07-18T22:00:00.000Z",
      },
    ],
    lastActivityAt: "2026-07-18T22:00:00.000Z",
    nextAction: null,
    followUpAt: null,
  },
]);
