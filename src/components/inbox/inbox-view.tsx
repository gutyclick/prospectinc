"use client";

import { Clock3 } from "lucide-react";
import { useMemo, useState } from "react";

import { ConversationDetail } from "@/components/inbox/conversation-detail";
import { ConversationList } from "@/components/inbox/conversation-list";
import { InboxFilterBar } from "@/components/inbox/inbox-filter-bar";
import { PageHeader } from "@/components/layout/page-header";
import { simulatedConversationIntelligence } from "@/lib/domain/conversation-intelligence";
import {
  matchesInboxFilter,
  type InboxFilter,
} from "@/lib/domain/inbox-filters";
import type { InboxItem, Proposal } from "@/lib/domain";
import { conversationRepository, prospectRepository } from "@/lib/repositories";

export function InboxView({
  initialItems,
  proposals,
}: {
  initialItems: InboxItem[];
  proposals: Proposal[];
}) {
  const initialSelected = initialItems[0] ?? null;
  const initialClassification = initialSelected
    ? simulatedConversationIntelligence.classify(
        initialSelected,
        initialSelected.prospect,
      )
    : null;
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<InboxFilter>("todos");
  const [selectedId, setSelectedId] = useState(initialItems[0]?.id ?? null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [response, setResponse] = useState(
    initialClassification?.suggestedResponse ?? "",
  );
  const [followUpAt, setFollowUpAt] = useState(
    initialSelected?.followUpAt?.slice(0, 16) ?? "",
  );
  const [notice, setNotice] = useState("");
  const filtered = useMemo(
    () => items.filter((item) => matchesInboxFilter(item, filter)),
    [filter, items],
  );
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const classification = selected
    ? simulatedConversationIntelligence.classify(selected, selected.prospect)
    : null;
  const proposal =
    proposals.find((item) => item.prospectId === selected?.prospectId) ?? null;
  const pending = items.filter(
    (item) => item.nextAction && item.status !== "cerrada",
  ).length;

  async function refresh(message: string) {
    setItems(await conversationRepository.getInboxItems(50));
    setNotice(message);
  }

  function select(id: string) {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) return;
    const intelligence = simulatedConversationIntelligence.classify(
      item,
      item.prospect,
    );
    setSelectedId(id);
    setDetailVisible(true);
    setFollowUpAt(item.followUpAt?.slice(0, 16) ?? "");
    void conversationRepository
      .getDraftResponse(id)
      .then((draft) => setResponse(draft || intelligence.suggestedResponse));
  }

  async function saveResponse() {
    if (!selected) return;
    await conversationRepository.saveDraftResponse(selected.id, response);
    setNotice("Respuesta guardada en el repositorio simulado.");
  }
  async function markSent() {
    if (!selected || !response.trim()) return;
    await conversationRepository.markResponseSent(selected.id, response.trim());
    await refresh(
      "Respuesta marcada como enviada. No se envió ningún mensaje real.",
    );
  }
  async function schedule() {
    if (!selected || !followUpAt) return;
    await conversationRepository.scheduleFollowUp(
      selected.id,
      new Date(followUpAt).toISOString(),
    );
    await prospectRepository.updateCommercialStatus(
      selected.prospectId,
      "seguimiento",
    );
    await refresh("Seguimiento programado correctamente.");
  }
  async function negotiation() {
    if (!selected) return;
    await prospectRepository.updateCommercialStatus(
      selected.prospectId,
      "negociacion",
    );
    await conversationRepository.updateStatus(
      selected.id,
      "respondio",
      "Preparar conversación de negociación",
    );
    await refresh("Conversación marcada como negociación.");
  }
  async function won() {
    if (!selected) return;
    await prospectRepository.updateCommercialStatus(
      selected.prospectId,
      "ganado",
    );
    await conversationRepository.updateStatus(selected.id, "cerrada", null);
    await refresh("Prospecto marcado como ganado.");
  }
  async function discard() {
    if (!selected) return;
    if (
      !window.confirm("¿Descartar esta conversación y cerrar su seguimiento?")
    )
      return;
    await prospectRepository.updateCommercialStatus(
      selected.prospectId,
      "descartado",
    );
    await conversationRepository.updateStatus(selected.id, "cerrada", null);
    await refresh("Conversación descartada.");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bandeja"
        description="Gestiona conversaciones y próximas acciones desde un solo lugar."
        action={
          <span className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
            <Clock3 className="size-4" aria-hidden="true" /> {pending} acciones
            pendientes
          </span>
        }
      />
      <InboxFilterBar items={items} active={filter} onChange={setFilter} />
      <div aria-live="polite" className="sr-only">
        {notice}
      </div>
      {notice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}
      <section
        className="grid min-h-[38rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-[calc(100vh-15rem)] lg:grid-cols-[22rem_minmax(0,1fr)]"
        aria-label="Bandeja unificada"
      >
        <aside
          className={`${detailVisible ? "hidden lg:flex" : "flex"} min-h-0 flex-col border-r border-slate-200`}
        >
          <header className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-950">Conversaciones</h2>
            <p className="text-xs text-slate-500">{filtered.length} visibles</p>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList
              items={filtered}
              selectedId={selectedId}
              onSelect={select}
            />
          </div>
        </aside>
        <div
          className={`${detailVisible ? "flex" : "hidden lg:flex"} min-h-0 flex-col`}
        >
          {selected && classification ? (
            <ConversationDetail
              item={selected}
              proposal={proposal}
              classification={classification}
              response={response}
              followUpAt={followUpAt}
              onResponseChange={setResponse}
              onFollowUpChange={setFollowUpAt}
              onBack={() => setDetailVisible(false)}
              onSave={() => void saveResponse()}
              onSent={() => void markSent()}
              onSchedule={() => void schedule()}
              onNegotiation={() => void negotiation()}
              onWon={() => void won()}
              onDiscard={() => void discard()}
            />
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center text-sm text-slate-500">
              Selecciona una conversación para ver el detalle.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
