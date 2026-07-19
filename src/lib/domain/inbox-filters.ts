import type { InboxItem } from "./models";

export type InboxFilter =
  | "todos"
  | "por-contactar"
  | "enviados"
  | "respondieron"
  | "seguimiento"
  | "negociacion"
  | "ganados";

export const inboxFilterLabels: Record<InboxFilter, string> = {
  todos: "Todos",
  "por-contactar": "Por contactar",
  enviados: "Enviados",
  respondieron: "Respondieron",
  seguimiento: "Seguimiento",
  negociacion: "Negociación",
  ganados: "Ganados",
};

export function matchesInboxFilter(item: InboxItem, filter: InboxFilter) {
  if (filter === "todos") return true;
  if (filter === "por-contactar") return item.status === "sin-contactar";
  if (filter === "enviados") return item.status === "esperando-respuesta";
  if (filter === "respondieron") return item.status === "respondio";
  if (filter === "seguimiento") return item.status === "seguimiento";
  if (filter === "negociacion")
    return item.prospect.commercialStatus === "negociacion";
  return item.prospect.commercialStatus === "ganado";
}

export function getInboxCounts(items: InboxItem[]) {
  return (Object.keys(inboxFilterLabels) as InboxFilter[]).reduce<
    Record<InboxFilter, number>
  >(
    (counts, filter) => ({
      ...counts,
      [filter]: items.filter((item) => matchesInboxFilter(item, filter)).length,
    }),
    {
      todos: 0,
      "por-contactar": 0,
      enviados: 0,
      respondieron: 0,
      seguimiento: 0,
      negociacion: 0,
      ganados: 0,
    },
  );
}
