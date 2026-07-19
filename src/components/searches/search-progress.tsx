import { Check, LoaderCircle } from "lucide-react";

export const SEARCH_STAGES = [
  "Buscando negocios",
  "Revisando presencia digital",
  "Detectando contactos",
  "Calculando oportunidad",
] as const;

type SearchProgressProps = {
  activeStage: number;
};

export function SearchProgress({ activeStage }: SearchProgressProps) {
  const progress = Math.round(((activeStage + 1) / SEARCH_STAGES.length) * 100);

  return (
    <section
      className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4"
      aria-live="polite"
      aria-label="Progreso del análisis"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-blue-950">
          {SEARCH_STAGES[activeStage]}
        </p>
        <span className="text-xs font-semibold text-blue-700">{progress}%</span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {SEARCH_STAGES.map((stage, index) => {
          const complete = index < activeStage;
          const active = index === activeStage;

          return (
            <li
              key={stage}
              className={`flex items-center gap-2 text-xs ${
                complete || active ? "text-blue-800" : "text-slate-400"
              }`}
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white ring-1 ring-blue-100">
                {complete ? (
                  <Check
                    className="size-3 text-emerald-600"
                    aria-hidden="true"
                  />
                ) : active ? (
                  <LoaderCircle
                    className="size-3 animate-spin text-blue-600"
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className="size-1.5 rounded-full bg-slate-300"
                    aria-hidden="true"
                  />
                )}
              </span>
              {stage}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
