"use client";

import { LayoutTemplate, Plus, Send, X } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ProposalFormModal } from "@/components/proposals/proposal-form-modal";
import { ProposalMetrics } from "@/components/proposals/proposal-metrics";
import { ProposalPerformance } from "@/components/proposals/proposal-performance";
import { ProposalPreview } from "@/components/proposals/proposal-preview";
import {
  filterProposals,
  ProposalTable,
  type ProposalFilters,
} from "@/components/proposals/proposal-table";
import { Button } from "@/components/ui/button";
import type { Proposal, Prospect } from "@/lib/domain";
import { proposalRepository } from "@/lib/repositories";
import type { ProposalFormValues } from "@/lib/validation";

const initialFilters: ProposalFilters = {
  query: "",
  status: "todos",
  date: "todos",
};

export function ProposalsView({
  initialProposals,
  prospects,
  initialProspectId,
}: {
  initialProposals: Proposal[];
  prospects: Prospect[];
  initialProspectId?: string;
}) {
  const [proposals, setProposals] = useState(initialProposals);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedId, setSelectedId] = useState(initialProposals[0]?.id ?? null);
  const [formOpen, setFormOpen] = useState(Boolean(initialProspectId));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const visible = useMemo(
    () => filterProposals(proposals, prospects, filters),
    [filters, proposals, prospects],
  );
  const selected =
    proposals.find((proposal) => proposal.id === selectedId) ?? null;
  const selectedProspect =
    prospects.find((prospect) => prospect.id === selected?.prospectId) ?? null;

  async function create(values: ProposalFormValues) {
    const prospect = prospects.find((item) => item.id === values.prospectId);
    if (!prospect) return;
    const proposal = await proposalRepository.create({
      prospectId: values.prospectId,
      service: values.service,
      price: values.price,
      currency: values.currency,
      summary: values.summary,
      includedItems: values.includedItems
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      recommendedAngle: prospect.recommendedOffer,
      deliveryTime: values.deliveryTime,
      callToAction: values.callToAction,
    });
    setProposals((current) => [proposal, ...current]);
    setSelectedId(proposal.id);
    setFormOpen(false);
    setNotice(`Propuesta para ${prospect.businessName} creada como borrador.`);
  }

  async function setStatus(status: "borrador" | "lista") {
    if (!selected) return;
    const updated = await proposalRepository.updateStatus(selected.id, status);
    setProposals((current) =>
      current.map((proposal) =>
        proposal.id === updated.id ? updated : proposal,
      ),
    );
    setConfirmOpen(false);
    setNotice(
      status === "lista"
        ? "La propuesta quedó lista para enviar. No se envió ningún mensaje."
        : "Borrador guardado localmente.",
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Propuestas"
        description="Crea, personaliza y prepara propuestas comerciales con contenido simulado."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              <LayoutTemplate className="size-4" /> Plantillas
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" /> Nueva propuesta
            </Button>
          </div>
        }
      />
      <div aria-live="polite" className="sr-only">
        {notice}
      </div>
      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}
      <ProposalMetrics proposals={proposals} />
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <ProposalTable
          proposals={visible}
          prospects={prospects}
          filters={filters}
          onFiltersChange={setFilters}
          onSelect={setSelectedId}
        />
        <ProposalPreview
          proposal={selected}
          prospect={selectedProspect}
          onSave={() => void setStatus("borrador")}
          onReady={() => setConfirmOpen(true)}
        />
      </div>
      <ProposalPerformance
        proposals={proposals}
        onTemplate={() => setFormOpen(true)}
      />
      <ProposalFormModal
        open={formOpen}
        prospects={prospects}
        initialProspectId={initialProspectId}
        onClose={() => setFormOpen(false)}
        onCreate={create}
      />
      {confirmOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Send className="size-5" />
              </span>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                aria-label="Cerrar confirmación"
                className="grid size-10 place-items-center rounded-xl hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <h2 id="confirm-title" className="mt-4 text-lg font-bold">
              Preparar para envío
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              En esta fase no se enviará ningún correo ni mensaje. La propuesta
              solo cambiará a “Lista para enviar”; la integración llegará en una
              fase posterior.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => void setStatus("lista")}>
                Marcar como lista
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
