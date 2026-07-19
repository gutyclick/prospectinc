import { Check, FileText, Mail, MessageCircle, Send } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import { proposalTemplates } from "@/lib/domain/proposal-tools";
import type { Proposal } from "@/lib/domain";

export function ProposalPerformance({
  proposals,
  onTemplate,
}: {
  proposals: Proposal[];
  onTemplate: () => void;
}) {
  const steps = [
    {
      label: "Borradores",
      value: proposals.filter((item) => item.status === "borrador").length,
      icon: FileText,
    },
    {
      label: "Listas",
      value: proposals.filter((item) => item.status === "lista").length,
      icon: Send,
    },
    {
      label: "Enviadas",
      value: proposals.filter((item) => item.status === "enviada").length,
      icon: Mail,
    },
    {
      label: "Respondidas",
      value: proposals.filter((item) => item.status === "negociacion").length,
      icon: MessageCircle,
    },
    {
      label: "Aceptadas",
      value: proposals.filter((item) => item.status === "aceptada").length,
      icon: Check,
    },
  ];
  return (
    <div className="space-y-4">
      <SectionCard
        title="Rendimiento de propuestas"
        contentClassName="grid grid-cols-2 gap-3 sm:grid-cols-5"
      >
        {steps.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
            <Icon className="mx-auto size-5 text-blue-600" aria-hidden="true" />
            <p className="mt-2 text-xl font-bold">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </SectionCard>
      <SectionCard
        title="Plantillas recomendadas"
        contentClassName="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {proposalTemplates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={onTemplate}
            className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <p className="font-semibold text-slate-900">{template.name}</p>
            <p className="mt-1 text-xs text-slate-500">{template.service}</p>
          </button>
        ))}
      </SectionCard>
    </div>
  );
}
