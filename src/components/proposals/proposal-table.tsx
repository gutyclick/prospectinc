import { Eye, FileText, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { proposalStatusLabels } from "@/lib/domain/proposal-tools";
import type { Proposal, ProposalStatus, Prospect } from "@/lib/domain";

export type ProposalFilters = {
  query: string;
  status: ProposalStatus | "todos";
  date: "todos" | "7" | "30";
};

const money = new Intl.NumberFormat("es-PA", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const date = new Intl.DateTimeFormat("es-PA", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function filterProposals(
  proposals: Proposal[],
  prospects: Prospect[],
  filters: ProposalFilters,
  now = new Date(),
) {
  const threshold =
    filters.date === "todos"
      ? null
      : new Date(now.getTime() - Number(filters.date) * 86_400_000);
  const query = filters.query.trim().toLocaleLowerCase("es");
  return proposals.filter((proposal) => {
    const prospect = prospects.find((item) => item.id === proposal.prospectId);
    return (
      (!query ||
        `${prospect?.businessName ?? ""} ${proposal.service}`
          .toLocaleLowerCase("es")
          .includes(query)) &&
      (filters.status === "todos" || proposal.status === filters.status) &&
      (!threshold || new Date(proposal.createdAt) >= threshold)
    );
  });
}

export function ProposalTable({
  proposals,
  prospects,
  filters,
  onFiltersChange,
  onSelect,
}: {
  proposals: Proposal[];
  prospects: Prospect[];
  filters: ProposalFilters;
  onFiltersChange: (filters: ProposalFilters) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <DataTableShell
      title={`Propuestas recientes · ${proposals.length} resultados`}
    >
      <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-3">
        <label className="relative">
          <span className="sr-only">Filtrar propuestas</span>
          <Search
            className="pointer-events-none absolute top-3 left-3 size-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            value={filters.query}
            onChange={(event) =>
              onFiltersChange({ ...filters, query: event.target.value })
            }
            className="h-10 w-full rounded-xl border border-slate-200 pr-3 pl-9 text-sm"
            placeholder="Filtrar propuestas..."
          />
        </label>
        <label>
          <span className="sr-only">Estado</span>
          <select
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                status: event.target.value as ProposalFilters["status"],
              })
            }
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option value="todos">Todos los estados</option>
            {Object.entries(proposalStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Fecha</span>
          <select
            value={filters.date}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                date: event.target.value as ProposalFilters["date"],
              })
            }
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option value="todos">Cualquier fecha</option>
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
          </select>
        </label>
      </div>
      {proposals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No hay propuestas con estos filtros"
          description="Prueba otro texto, estado o intervalo de fecha."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">
              Listado de propuestas comerciales
            </caption>
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                {[
                  "Negocio",
                  "Servicio",
                  "Valor",
                  "Fecha",
                  "Estado",
                  "Acción",
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-4 py-3 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proposals.map((proposal) => {
                const prospect = prospects.find(
                  (item) => item.id === proposal.prospectId,
                );
                return (
                  <tr key={proposal.id} className="hover:bg-slate-50">
                    <th
                      scope="row"
                      className="px-4 py-3 font-semibold text-slate-900"
                    >
                      {prospect?.businessName ?? "Prospecto no disponible"}
                    </th>
                    <td className="px-4 py-3 text-slate-600">
                      {proposal.service}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {money.format(proposal.price)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {date.format(new Date(proposal.createdAt))}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        tone={
                          proposal.status === "aceptada"
                            ? "green"
                            : proposal.status === "lista"
                              ? "blue"
                              : proposal.status === "descartada"
                                ? "neutral"
                                : "orange"
                        }
                      >
                        {proposalStatusLabels[proposal.status]}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelect(proposal.id)}
                      >
                        <Eye className="size-4" aria-hidden="true" /> Ver
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DataTableShell>
  );
}
