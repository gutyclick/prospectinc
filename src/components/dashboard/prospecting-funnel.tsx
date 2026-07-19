import {
  CheckCircle2,
  FileText,
  MessageCircle,
  Search,
  Send,
  Users,
} from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import type { ProspectingFunnel as ProspectingFunnelData } from "@/lib/domain";

type ProspectingFunnelProps = {
  funnel: ProspectingFunnelData;
};

export function ProspectingFunnel({ funnel }: ProspectingFunnelProps) {
  const stages = [
    {
      label: "Encontrados",
      value: funnel.found,
      icon: Search,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Calificados",
      value: funnel.qualified,
      icon: Users,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Propuestas",
      value: funnel.proposals,
      icon: FileText,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Contactados",
      value: funnel.contacted,
      icon: Send,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Respondieron",
      value: funnel.responded,
      icon: MessageCircle,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <SectionCard title="Embudo de prospección" contentClassName="p-0">
      <ol className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-5">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const rate =
            funnel.found === 0
              ? 0
              : Math.round((stage.value / funnel.found) * 100);

          return (
            <li key={stage.label} className="relative bg-white p-5">
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-10 place-items-center rounded-xl ${stage.color}`}
                >
                  <Icon
                    className="size-5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {stage.label}
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-slate-950">
                    {stage.value}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${rate}%` }}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">{rate}% del total</p>
              {index < stages.length - 1 ? (
                <CheckCircle2
                  className="absolute top-1/2 -right-2.5 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-white text-slate-300 xl:block"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}
