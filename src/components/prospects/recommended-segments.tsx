import { AtSign, Globe2, MessageCircle, MonitorUp } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import type { Prospect } from "@/lib/domain";

export function RecommendedSegments({ prospects }: { prospects: Prospect[] }) {
  const segments = [
    {
      label: "Sin web",
      value: prospects.filter(
        (prospect) => prospect.websiteStatus === "sin-sitio",
      ).length,
      helper: "Mayor urgencia",
      icon: Globe2,
      tone: "bg-red-50 text-red-600",
    },
    {
      label: "Con WhatsApp",
      value: prospects.filter((prospect) => prospect.publicWhatsapp).length,
      helper: "Contacto directo",
      icon: MessageCircle,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Web antigua",
      value: prospects.filter(
        (prospect) => prospect.websiteStatus === "desactualizado",
      ).length,
      helper: "Buena oportunidad",
      icon: MonitorUp,
      tone: "bg-orange-50 text-orange-600",
    },
    {
      label: "Solo Instagram",
      value: prospects.filter(
        (prospect) => prospect.websiteStatus === "solo-redes",
      ).length,
      helper: "Sin canal propio",
      icon: AtSign,
      tone: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <SectionCard
      title="Segmentos recomendados"
      contentClassName="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {segments.map((segment) => {
        const Icon = segment.icon;
        return (
          <article
            key={segment.label}
            className="rounded-xl border border-slate-200 p-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid size-10 place-items-center rounded-xl ${segment.tone}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-medium text-slate-600">
                  {segment.label}
                </p>
                <p className="text-xl font-bold text-slate-950">
                  {segment.value}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{segment.helper}</p>
          </article>
        );
      })}
    </SectionCard>
  );
}
