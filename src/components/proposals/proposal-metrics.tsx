import { CircleCheckBig, FileText, Send, WalletCards } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { calculateProposalMetrics } from "@/lib/domain/proposal-tools";
import type { Proposal } from "@/lib/domain";

const currency = new Intl.NumberFormat("es-PA", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ProposalMetrics({ proposals }: { proposals: Proposal[] }) {
  const metrics = calculateProposalMetrics(proposals);
  return (
    <section
      aria-label="Métricas de propuestas"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <MetricCard
        label="Propuestas creadas"
        value={metrics.total}
        icon={FileText}
        helperText="En el prototipo"
      />
      <MetricCard
        label="Listas para enviar"
        value={metrics.ready}
        icon={Send}
        helperText="Requieren revisión humana"
      />
      <MetricCard
        label="Aceptadas"
        value={metrics.accepted}
        icon={CircleCheckBig}
        helperText="Cierres registrados"
      />
      <MetricCard
        label="Valor estimado"
        value={currency.format(metrics.estimatedValue)}
        icon={WalletCards}
        helperText="En propuestas activas"
      />
    </section>
  );
}
