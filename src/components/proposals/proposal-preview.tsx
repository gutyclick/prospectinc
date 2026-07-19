import { Check, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { proposalStatusLabels } from "@/lib/domain/proposal-tools";
import type { Proposal, Prospect } from "@/lib/domain";

const money = new Intl.NumberFormat("es-PA", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ProposalPreview({
  proposal,
  prospect,
  onSave,
  onReady,
}: {
  proposal: Proposal | null;
  prospect: Prospect | null;
  onSave: () => void;
  onReady: () => void;
}) {
  if (!proposal || !prospect)
    return (
      <SectionCard title="Vista previa">
        <p className="py-10 text-center text-sm text-slate-500">
          Selecciona una propuesta para revisar su contenido.
        </p>
      </SectionCard>
    );
  return (
    <SectionCard title="Vista previa de propuesta" contentClassName="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-bold text-slate-950">
            {prospect.businessName}
          </p>
          <p className="text-sm text-slate-500">
            {prospect.niche} · {prospect.location}
          </p>
        </div>
        <p className="text-2xl font-bold text-slate-950">
          {money.format(proposal.price)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="blue">{proposal.service}</StatusBadge>
        <StatusBadge tone={proposal.status === "aceptada" ? "green" : "orange"}>
          {proposalStatusLabels[proposal.status]}
        </StatusBadge>
      </div>
      <div>
        <h3 className="text-sm font-semibold">Resumen</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {proposal.summary}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold">Elementos incluidos</h3>
        <ul className="mt-2 space-y-2">
          {proposal.includedItems.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-600">
              <Check
                className="mt-0.5 size-4 shrink-0 text-blue-600"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl bg-blue-50 p-4">
        <h3 className="text-sm font-semibold text-blue-950">
          Oferta recomendada
        </h3>
        <p className="mt-1 text-sm text-blue-800">
          {proposal.recommendedAngle}
        </p>
        <p className="mt-2 text-xs text-blue-700">
          Plazo: {proposal.deliveryTime}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onSave}>
          <Save className="size-4" aria-hidden="true" /> Guardar borrador
        </Button>
        <Button
          onClick={onReady}
          disabled={
            proposal.status === "aceptada" || proposal.status === "descartada"
          }
        >
          <Send className="size-4" aria-hidden="true" /> Enviar propuesta
        </Button>
      </div>
    </SectionCard>
  );
}
