"use client";

import { Download, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import type { Prospect } from "@/lib/domain";
import {
  applyProspectFilters,
  prospectFiltersToSearchParams,
  type ProspectFilters as ProspectFilterValues,
} from "@/lib/domain/prospect-filters";
import { prospectRepository } from "@/lib/repositories";
import { downloadProspectsCsv } from "@/lib/utils/prospect-csv";
import type { ProspectFormValues } from "@/lib/validation";

import { AddProspectModal } from "./add-prospect-modal";
import { ProspectFilters } from "./prospect-filters";
import { ProspectMetrics } from "./prospect-metrics";
import { ProspectQuickView } from "./prospect-quick-view";
import { ProspectsTable } from "./prospects-table";
import { RecommendedSegments } from "./recommended-segments";
import { StatusDistribution } from "./status-distribution";

export function ProspectsView({
  initialProspects,
  initialFilters,
}: {
  initialProspects: Prospect[];
  initialFilters: ProspectFilterValues;
}) {
  const [prospects, setProspects] = useState(initialProspects);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialProspects[0]?.id ?? null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const visibleProspects = useMemo(
    () => applyProspectFilters(prospects, filters),
    [filters, prospects],
  );
  const selectedProspect =
    prospects.find((prospect) => prospect.id === selectedId) ?? null;

  useEffect(() => {
    const params = prospectFiltersToSearchParams(filters);
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `/prospectos?${query}` : "/prospectos",
    );
  }, [filters]);

  function updateFilters(changes: Partial<ProspectFilterValues>) {
    setFilters((current) => ({ ...current, ...changes }));
  }

  async function addProspect(values: ProspectFormValues) {
    const prospect = await prospectRepository.createProspect(values);
    setProspects((current) => [prospect, ...current]);
    setSelectedId(prospect.id);
    setModalOpen(false);
    setNotification(
      `${prospect.businessName} se añadió al repositorio simulado.`,
    );
  }

  function exportVisibleProspects() {
    downloadProspectsCsv(visibleProspects);
    setNotification(
      `Se exportaron ${visibleProspects.length} prospectos visibles.`,
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospectos"
        description="Gestiona, analiza y prioriza tus mejores oportunidades comerciales."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={exportVisibleProspects}
              disabled={visibleProspects.length === 0}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-600 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="size-4" aria-hidden="true" />
              Exportar lista
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-[var(--shadow-brand)] hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Plus className="size-4" aria-hidden="true" />
              Añadir prospecto
            </button>
          </div>
        }
      />

      {notification ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          {notification}
        </div>
      ) : null}

      <ProspectMetrics prospects={prospects} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.75fr)]">
        <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-white shadow-[var(--shadow-card)]">
          <header className="px-4 pt-4">
            <h2 className="text-sm font-semibold text-slate-950">
              Lista de prospectos
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {visibleProspects.length} de {prospects.length} visibles
            </p>
          </header>
          <ProspectFilters
            filters={filters}
            prospects={prospects}
            onChange={updateFilters}
          />
          <ProspectsTable
            prospects={visibleProspects}
            onSelect={setSelectedId}
          />
        </section>

        <ProspectQuickView
          prospect={selectedProspect}
          onSave={() =>
            setNotification(
              `${selectedProspect?.businessName ?? "El prospecto"} se guardó.`,
            )
          }
        />
      </div>

      <RecommendedSegments prospects={prospects} />
      <StatusDistribution prospects={prospects} />

      <AddProspectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addProspect}
      />
    </div>
  );
}
