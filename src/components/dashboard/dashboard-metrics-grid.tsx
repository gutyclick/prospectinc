import { FileCheck2, MessageCircle, Store, Star } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import type { DashboardMetrics } from "@/lib/domain";

type DashboardMetricsGridProps = {
  metrics: DashboardMetrics;
};

export function DashboardMetricsGrid({ metrics }: DashboardMetricsGridProps) {
  return (
    <section
      aria-label="Resumen de hoy"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <MetricCard
        label="Negocios encontrados"
        value={metrics.prospectsTotal}
        icon={Store}
        helperText="Prospectos disponibles"
      />
      <MetricCard
        label="Oportunidades fuertes"
        value={metrics.priorityProspects}
        icon={Star}
        tone="green"
        helperText={`Promedio ${metrics.averageOpportunityScore}/100`}
      />
      <MetricCard
        label="Propuestas listas"
        value={metrics.readyProposals}
        icon={FileCheck2}
        tone="orange"
        helperText="Preparadas para revisión"
      />
      <MetricCard
        label="Respuestas"
        value={metrics.inboxResponses}
        icon={MessageCircle}
        tone="purple"
        helperText="Requieren seguimiento"
      />
    </section>
  );
}
