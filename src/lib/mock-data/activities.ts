import { z } from "zod";

import { activitySchema } from "@/lib/validation";

export const mockActivities = z.array(activitySchema).parse([
  {
    id: "activity-search-dentists",
    type: "busqueda",
    description:
      "Se completó una búsqueda simulada de clínicas dentales en Ciudad de Panamá.",
    createdAt: "2026-07-19T00:20:00.000Z",
  },
  {
    id: "activity-response-toscana",
    type: "respuesta",
    description: "Restaurante La Toscana respondió al contacto registrado.",
    createdAt: "2026-07-19T00:05:00.000Z",
  },
  {
    id: "activity-proposal-nova",
    type: "propuesta",
    description: "Se actualizó el borrador de Clínica Dental Nova.",
    createdAt: "2026-07-18T18:30:00.000Z",
  },
  {
    id: "activity-contact-automax",
    type: "contacto",
    description: "Se registró un contacto manual con Taller AutoMax.",
    createdAt: "2026-07-18T17:10:00.000Z",
  },
  {
    id: "activity-priority-nova",
    type: "prospecto",
    description:
      "Clínica Dental Nova se marcó como prospecto de alta prioridad.",
    createdAt: "2026-07-18T15:30:00.000Z",
  },
  {
    id: "activity-follow-up-rivera",
    type: "seguimiento",
    description: "Se programó seguimiento con Abogados Rivera.",
    createdAt: "2026-07-17T20:00:00.000Z",
  },
]);
