import { format } from "date-fns";
import { es } from "date-fns/locale";

import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Search as SearchRecord } from "@/lib/domain";
import { Search } from "lucide-react";

type SearchHistoryTableProps = {
  searches: SearchRecord[];
};

export function SearchHistoryTable({ searches }: SearchHistoryTableProps) {
  if (searches.length === 0) {
    return (
      <EmptyState
        title="No hay resultados para este filtro"
        description="Prueba otro filtro o configura una nueva búsqueda real."
        icon={Search}
      />
    );
  }

  return (
    <DataTableShell title="Resultados recientes" minimumWidth="48rem">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          Historial de búsquedas con Google Places
        </caption>
        <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500">
          <tr>
            {[
              "Búsqueda",
              "Ubicación",
              "Fecha",
              "Resultados",
              "Oportunidades",
              "Nuevos / deduplicados",
              "Operaciones",
              "Estado",
            ].map((heading) => (
              <th key={heading} scope="col" className="px-4 py-3">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {searches.map((search) => (
            <tr key={search.id} className="text-slate-600 hover:bg-slate-50/60">
              <th
                scope="row"
                className="px-4 py-3 font-semibold text-slate-900"
              >
                {search.query}
              </th>
              <td className="px-4 py-3">{search.location}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {format(new Date(search.createdAt), "d MMM", { locale: es })}
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">
                {search.resultsCount}
              </td>
              <td className="px-4 py-3 font-medium text-blue-700">
                {search.opportunitiesCount}
              </td>
              <td className="px-4 py-3">
                {search.insertedCount} / {search.deduplicatedCount}
              </td>
              <td className="px-4 py-3">{search.providerCallCount}</td>
              <td className="px-4 py-3">
                <StatusBadge
                  tone={
                    search.status === "completada"
                      ? "green"
                      : search.status === "analizando"
                        ? "orange"
                        : search.status === "fallida"
                          ? "red"
                          : "neutral"
                  }
                >
                  {search.status === "completada"
                    ? "Completada"
                    : search.status === "analizando"
                      ? "Analizando"
                      : search.status === "fallida"
                        ? "Fallida"
                        : "Borrador"}
                </StatusBadge>
                {search.errorMessage ? (
                  <p className="mt-1 max-w-56 text-xs text-red-700">
                    {search.errorMessage}
                  </p>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableShell>
  );
}
