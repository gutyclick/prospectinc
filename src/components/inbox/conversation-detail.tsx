import {
  ArrowLeft,
  CalendarClock,
  Check,
  CircleDollarSign,
  Save,
  Send,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ConversationClassification } from "@/lib/domain/conversation-intelligence";
import { commercialStatusLabels } from "@/lib/domain/prospect-presentation";
import type { InboxItem, Proposal } from "@/lib/domain";

const dateTime = new Intl.DateTimeFormat("es-PA", {
  dateStyle: "medium",
  timeStyle: "short",
});
const money = new Intl.NumberFormat("es-PA", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ConversationDetail({
  item,
  proposal,
  classification,
  response,
  followUpAt,
  onResponseChange,
  onFollowUpChange,
  onBack,
  onSave,
  onSent,
  onSchedule,
  onNegotiation,
  onWon,
  onDiscard,
}: {
  item: InboxItem;
  proposal: Proposal | null;
  classification: ConversationClassification;
  response: string;
  followUpAt: string;
  onResponseChange: (value: string) => void;
  onFollowUpChange: (value: string) => void;
  onBack: () => void;
  onSave: () => void;
  onSent: () => void;
  onSchedule: () => void;
  onNegotiation: () => void;
  onWon: () => void;
  onDiscard: () => void;
}) {
  return (
    <article className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-slate-200 p-4">
        <Button variant="ghost" className="mb-2 lg:hidden" onClick={onBack}>
          <ArrowLeft className="size-4" /> Volver
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {item.prospect.businessName}
            </h2>
            <p className="text-sm text-slate-500">
              {item.prospect.niche} · {item.prospect.location}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {item.prospect.opportunityScore}
            </p>
            <StatusBadge tone="purple">
              {commercialStatusLabels[item.prospect.commercialStatus]}
            </StatusBadge>
          </div>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <section aria-labelledby="history-title">
          <h3 id="history-title" className="text-sm font-semibold">
            Historial cronológico
          </h3>
          <ol className="mt-3 space-y-3">
            {item.messages.length ? (
              item.messages.map((message) => (
                <li
                  key={message.id}
                  className={`flex ${message.direction === "saliente" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.direction === "saliente" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    <p>{message.body}</p>
                    <time
                      className={`mt-1 block text-xs ${message.direction === "saliente" ? "text-blue-100" : "text-slate-400"}`}
                    >
                      {dateTime.format(new Date(message.createdAt))}
                    </time>
                  </div>
                </li>
              ))
            ) : (
              <li className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Aún no se ha iniciado el contacto.
              </li>
            )}
          </ol>
        </section>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold">Análisis simulado</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.prospect.aiSummary}
            </p>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Intención detectada
            </p>
            <StatusBadge
              tone={
                classification.intent === "no-interesado"
                  ? "red"
                  : classification.intent === "sin-respuesta"
                    ? "neutral"
                    : "green"
              }
            >
              {classification.label}
            </StatusBadge>
            <p className="mt-3 text-sm text-slate-600">
              <strong>Próxima acción:</strong>{" "}
              {classification.recommendedAction}
            </p>
          </section>
          <section className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold">Propuesta asociada</h3>
            {proposal ? (
              <>
                <p className="mt-2 font-semibold text-slate-900">
                  {proposal.service}
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {money.format(proposal.price)}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {proposal.summary}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No hay una propuesta asociada.
              </p>
            )}
          </section>
        </div>
        <label className="mt-5 block">
          <span className="text-sm font-semibold">
            Respuesta sugerida editable
          </span>
          <textarea
            value={response}
            onChange={(event) => onResponseChange(event.target.value)}
            rows={5}
            className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-400 focus:ring-3 focus:ring-blue-100 focus:outline-none"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={onSave}>
            <Save className="size-4" /> Guardar respuesta
          </Button>
          <Button onClick={onSent} disabled={!response.trim()}>
            <Send className="size-4" /> Marcar como enviada
          </Button>
        </div>
        <section className="mt-5 rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold">Programar seguimiento</h3>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">Fecha y hora de seguimiento</span>
              <input
                type="datetime-local"
                value={followUpAt}
                onChange={(event) => onFollowUpChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              />
            </label>
            <Button
              variant="outline"
              onClick={onSchedule}
              disabled={!followUpAt}
            >
              <CalendarClock className="size-4" /> Programar
            </Button>
          </div>
        </section>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={onNegotiation}>
            <CircleDollarSign className="size-4" /> Marcar negociación
          </Button>
          <Button variant="outline" onClick={onWon}>
            <Check className="size-4" /> Marcar ganado
          </Button>
          <Button variant="destructive" onClick={onDiscard}>
            <Trash2 className="size-4" /> Descartar
          </Button>
        </div>
      </div>
    </article>
  );
}
