import type { Conversation, Prospect } from "./models";

export type ConversationIntent =
  | "interesado"
  | "pregunta-precio"
  | "mas-informacion"
  | "no-interesado"
  | "sin-respuesta";

export type ConversationClassification = {
  intent: ConversationIntent;
  label: string;
  recommendedAction: string;
  suggestedResponse: string;
};

export interface ConversationIntelligence {
  classify(
    conversation: Conversation,
    prospect: Prospect,
  ): ConversationClassification;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

export const simulatedConversationIntelligence: ConversationIntelligence = {
  classify(conversation, prospect) {
    const incoming = conversation.messages
      .filter((message) => message.direction === "entrante")
      .at(-1);
    const text = normalize(incoming?.body ?? "");
    if (!incoming)
      return {
        intent: "sin-respuesta",
        label: "Sin respuesta",
        recommendedAction: "Programar un seguimiento breve y respetuoso.",
        suggestedResponse: `Hola, equipo de ${prospect.businessName}. Quedo atento por si desean revisar la propuesta o resolver alguna duda.`,
      };
    if (/no interesa|no deseamos|descartar/.test(text))
      return {
        intent: "no-interesado",
        label: "No interesado",
        recommendedAction: "Cerrar la conversación sin nuevos contactos.",
        suggestedResponse: `Gracias por responder. Cerramos el seguimiento y quedamos disponibles si sus prioridades cambian.`,
      };
    if (/precio|costo|presupuesto|cuanto/.test(text))
      return {
        intent: "pregunta-precio",
        label: "Pregunta por precio",
        recommendedAction:
          "Explicar el alcance incluido y ofrecer una alternativa.",
        suggestedResponse: `Gracias por su interés. El precio refleja el alcance detallado en la propuesta; puedo mostrarles una opción ajustada y sus diferencias.`,
      };
    if (/detalle|informacion|alcance|tiempo|reserva/.test(text))
      return {
        intent: "mas-informacion",
        label: "Solicita más información",
        recommendedAction:
          "Responder con alcance, plazo y siguiente paso concreto.",
        suggestedResponse: `Con gusto. La propuesta incluye ${prospect.recommendedOffer.toLocaleLowerCase("es")}. Podemos revisar alcance y tiempos en una llamada breve.`,
      };
    return {
      intent: "interesado",
      label: "Interesado",
      recommendedAction: "Proponer una llamada para avanzar con el alcance.",
      suggestedResponse: `¡Excelente! El siguiente paso recomendado es revisar juntos el alcance y acordar una fecha de inicio.`,
    };
  },
};
