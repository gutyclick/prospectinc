import { Search, Sparkles, Users } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import type { Search as SearchRecord } from "@/lib/domain";

type SearchMetricsProps = {
  searches: SearchRecord[];
};

export function SearchMetrics({ searches }: SearchMetricsProps) {
  const results = searches.reduce(
    (total, search) => total + search.resultsCount,
    0,
  );
  const opportunities = searches.reduce(
    (total, search) => total + search.opportunitiesCount,
    0,
  );

  return (
    <section
      aria-label="Métricas de búsquedas"
      className="grid gap-4 md:grid-cols-3"
    >
      <MetricCard
        label="Búsquedas realizadas"
        value={searches.length}
        icon={Search}
        helperText="Historial simulado"
      />
      <MetricCard
        label="Negocios encontrados"
        value={results}
        icon={Users}
        tone="green"
        helperText="Resultados acumulados"
      />
      <MetricCard
        label="Oportunidades detectadas"
        value={opportunities}
        icon={Sparkles}
        tone="purple"
        helperText="Requieren revisión humana"
      />
    </section>
  );
}
