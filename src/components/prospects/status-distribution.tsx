import { SectionCard } from "@/components/ui/section-card";
import type { Prospect } from "@/lib/domain";

export function StatusDistribution({ prospects }: { prospects: Prospect[] }) {
  const stages = [
    {
      label: "Nuevos",
      value: prospects.filter((prospect) =>
        ["nuevo", "analizando"].includes(prospect.commercialStatus),
      ).length,
      color: "bg-blue-500",
    },
    {
      label: "Calificados",
      value: prospects.filter(
        (prospect) => prospect.commercialStatus === "calificado",
      ).length,
      color: "bg-emerald-500",
    },
    {
      label: "Priorizados",
      value: prospects.filter(
        (prospect) => prospect.commercialStatus === "alta-prioridad",
      ).length,
      color: "bg-orange-500",
    },
    {
      label: "Con propuesta",
      value: prospects.filter(
        (prospect) => prospect.commercialStatus === "propuesta-lista",
      ).length,
      color: "bg-violet-500",
    },
    {
      label: "En seguimiento",
      value: prospects.filter((prospect) =>
        ["contactado", "respondio", "seguimiento", "negociacion"].includes(
          prospect.commercialStatus,
        ),
      ).length,
      color: "bg-slate-500",
    },
  ];

  return (
    <SectionCard
      title="Distribución por estado"
      contentClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
    >
      {stages.map((stage) => (
        <article
          key={stage.label}
          className="rounded-xl bg-slate-50 p-4 text-center"
        >
          <span
            className={`mx-auto block size-2.5 rounded-full ${stage.color}`}
            aria-hidden="true"
          />
          <p className="mt-2 text-xs text-slate-500">{stage.label}</p>
          <p className="mt-1 text-xl font-bold text-slate-950">{stage.value}</p>
        </article>
      ))}
    </SectionCard>
  );
}
