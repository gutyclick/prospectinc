import { Filter, Search } from "lucide-react";

import type { Prospect } from "@/lib/domain";
import type { ProspectFilters as ProspectFilterValues } from "@/lib/domain/prospect-filters";

type ProspectFiltersProps = {
  filters: ProspectFilterValues;
  prospects: Prospect[];
  onChange: (changes: Partial<ProspectFilterValues>) => void;
};

const fieldClassName =
  "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100";

export function ProspectFilters({
  filters,
  prospects,
  onChange,
}: ProspectFiltersProps) {
  const niches = [
    ...new Set(prospects.map((prospect) => prospect.niche)),
  ].toSorted();

  return (
    <div className="space-y-3 border-b border-slate-100 p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(13rem,1.4fr)_1fr_1fr_auto]">
        <label className="relative">
          <span className="sr-only">Filtrar prospectos</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Filtrar prospectos…"
            className={`${fieldClassName} w-full pl-10`}
          />
        </label>
        <label>
          <span className="sr-only">Filtrar por nicho</span>
          <select
            value={filters.niche}
            onChange={(event) => onChange({ niche: event.target.value })}
            className={`${fieldClassName} w-full`}
          >
            <option value="todos">Todos los nichos</option>
            {niches.map((niche) => (
              <option key={niche} value={niche}>
                {niche}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Ordenar prospectos</span>
          <select
            value={filters.sort}
            onChange={(event) =>
              onChange({
                sort: event.target.value as ProspectFilterValues["sort"],
              })
            }
            className={`${fieldClassName} w-full`}
          >
            <option value="score-desc">Mayor puntaje</option>
            <option value="score-asc">Menor puntaje</option>
            <option value="recent">Actualizados recientemente</option>
          </select>
        </label>
        <span className="hidden size-10 place-items-center rounded-xl border border-slate-200 text-slate-500 xl:grid">
          <Filter className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <label className="text-xs font-medium text-slate-600">
          Estado web
          <select
            value={filters.websiteStatus}
            onChange={(event) =>
              onChange({
                websiteStatus: event.target
                  .value as ProspectFilterValues["websiteStatus"],
              })
            }
            className={`${fieldClassName} mt-1.5 w-full`}
          >
            <option value="todos">Todos</option>
            <option value="sin-sitio">Sin web</option>
            <option value="desactualizado">Web antigua</option>
            <option value="solo-redes">Solo Instagram</option>
            <option value="basico">Web básica</option>
            <option value="optimizado">Optimizada</option>
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          Canal detectado
          <select
            value={filters.channel}
            onChange={(event) =>
              onChange({
                channel: event.target.value as ProspectFilterValues["channel"],
              })
            }
            className={`${fieldClassName} mt-1.5 w-full`}
          >
            <option value="todos">Todos</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="correo">Correo</option>
            <option value="telefono">Teléfono</option>
            <option value="sin-contacto">Sin contacto</option>
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          Puntaje mínimo:{" "}
          <strong className="text-blue-700">{filters.minimumScore}</strong>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={filters.minimumScore}
            onChange={(event) =>
              onChange({ minimumScore: Number(event.target.value) })
            }
            className="mt-3 w-full accent-blue-600"
          />
        </label>
      </div>

      <fieldset>
        <legend className="text-xs font-semibold text-slate-600">
          Exclusiones
        </legend>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="flex min-h-9 cursor-pointer items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={filters.excludeDuplicates}
              onChange={(event) =>
                onChange({ excludeDuplicates: event.target.checked })
              }
              className="size-4 rounded accent-blue-600"
            />
            Excluir duplicados
          </label>
          <label className="flex min-h-9 cursor-pointer items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={filters.excludeAgencies}
              onChange={(event) =>
                onChange({ excludeAgencies: event.target.checked })
              }
              className="size-4 rounded accent-blue-600"
            />
            Excluir agencias
          </label>
        </div>
      </fieldset>
    </div>
  );
}
