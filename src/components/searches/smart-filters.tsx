import { Filter } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";

export type SearchFilter =
  "todos" | "completadas" | "analizando" | "alta-oportunidad";

type SmartFiltersProps = {
  activeFilter: SearchFilter;
  onChange: (filter: SearchFilter) => void;
};

const filters: Array<{ value: SearchFilter; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "completadas", label: "Completadas" },
  { value: "analizando", label: "Analizando" },
  { value: "alta-oportunidad", label: "10+ oportunidades" },
];

export function SmartFilters({ activeFilter, onChange }: SmartFiltersProps) {
  return (
    <SectionCard
      title="Filtros inteligentes"
      action={
        <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
          <Filter className="size-4" aria-hidden="true" />
        </span>
      }
      contentClassName="flex flex-wrap gap-2"
    >
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          aria-pressed={activeFilter === filter.value}
          onClick={() => onChange(filter.value)}
          className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-pressed:border-blue-600 aria-pressed:bg-blue-600 aria-pressed:text-white"
        >
          {filter.label}
        </button>
      ))}
    </SectionCard>
  );
}
