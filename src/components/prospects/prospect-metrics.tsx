import { Clock3, MailCheck, Star, Users } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import type { Prospect } from "@/lib/domain";
import { getProspectContactChannel } from "@/lib/domain/prospect-presentation";

export function ProspectMetrics({ prospects }: { prospects: Prospect[] }) {
  const priority = prospects.filter(
    (prospect) => prospect.commercialStatus === "alta-prioridad",
  ).length;
  const contactable = prospects.filter(
    (prospect) => getProspectContactChannel(prospect) !== "sin-contacto",
  ).length;
  const contactedStatuses = new Set([
    "contactado",
    "respondio",
    "seguimiento",
    "negociacion",
    "ganado",
  ]);
  const notContacted = prospects.filter(
    (prospect) => !contactedStatuses.has(prospect.commercialStatus),
  ).length;

  return (
    <section
      aria-label="Métricas de prospectos"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <MetricCard
        label="Prospectos totales"
        value={prospects.length}
        icon={Users}
      />
      <MetricCard
        label="Alta prioridad"
        value={priority}
        icon={Star}
        tone="green"
      />
      <MetricCard
        label="Contactables"
        value={contactable}
        icon={MailCheck}
        tone="purple"
      />
      <MetricCard
        label="Sin contactar"
        value={notContacted}
        icon={Clock3}
        tone="orange"
      />
    </section>
  );
}
