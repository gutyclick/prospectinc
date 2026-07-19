"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { RecentActivity } from "@/components/dashboard/recent-activity";
import { discoverBusinessesAction } from "@/app/actions/data";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/ui/section-card";
import type { Activity, Search as SearchRecord } from "@/lib/domain";
import type { SearchFormValues } from "@/lib/validation";

import { PanamaOpportunityMap } from "./panama-opportunity-map";
import { SearchConfigurationForm } from "./search-configuration-form";
import { SearchHistoryTable } from "./search-history-table";
import { SearchMetrics } from "./search-metrics";
import { SearchProgress } from "./search-progress";
import { SearchSuggestions } from "./search-suggestions";
import { SmartFilters, type SearchFilter } from "./smart-filters";

type SearchesViewProps = {
  initialSearches: SearchRecord[];
  initialActivities: Activity[];
  stageDelayMs?: number;
};

export function filterSearches(searches: SearchRecord[], filter: SearchFilter) {
  if (filter === "completadas") {
    return searches.filter((search) => search.status === "completada");
  }
  if (filter === "analizando") {
    return searches.filter((search) => search.status === "analizando");
  }
  if (filter === "alta-oportunidad") {
    return searches.filter((search) => search.opportunitiesCount >= 10);
  }
  return searches;
}

export function SearchesView({
  initialSearches,
  initialActivities,
  stageDelayMs = 500,
}: SearchesViewProps) {
  const [searches, setSearches] = useState(initialSearches);
  const [activities, setActivities] = useState(initialActivities);
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("todos");
  const [activeStage, setActiveStage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [repeatedInput, setRepeatedInput] = useState<SearchFormValues | null>(
    null,
  );
  const [latestCompletedSearchId, setLatestCompletedSearchId] = useState<
    string | null
  >(null);

  const filteredSearches = useMemo(
    () => filterSearches(searches, activeFilter),
    [activeFilter, searches],
  );

  async function startSearch(
    values: SearchFormValues,
    confirmRepeated = false,
  ) {
    setNotification(null);
    setRepeatedInput(null);
    setIsProcessing(true);
    setActiveStage(0);
    const progressTimer = window.setInterval(() => {
      setActiveStage((current) => Math.min(current + 1, 2));
    }, stageDelayMs);

    try {
      const result = await discoverBusinessesAction({
        ...values,
        confirmRepeated,
      });
      if (!result.ok) {
        if (result.requiresConfirmation) setRepeatedInput(values);
        throw new Error(result.error);
      }
      setActiveStage(3);
      const {
        search: completed,
        inserted,
        deduplicated,
        providerCalls,
      } = result.data;
      setSearches((current) => [
        completed,
        ...current.filter((item) => item.id !== completed.id),
      ]);
      setLatestCompletedSearchId(completed.id);
      setActivities((current) => [
        {
          id: `activity-${completed.id}`,
          type: "busqueda",
          description: `Se completó la búsqueda de ${completed.query} en ${completed.location}.`,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      setNotification(
        `Búsqueda completada: ${inserted} negocios nuevos, ${deduplicated} deduplicados y ${providerCalls} operación de proveedor.`,
      );
    } catch (error) {
      setNotification(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la búsqueda. Intenta nuevamente.",
      );
    } finally {
      window.clearInterval(progressTimer);
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Búsquedas"
        description="Descubre negocios por nicho, ubicación y nivel de oportunidad."
        action={
          <Link
            href="#crear-busqueda"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-[var(--shadow-brand)] hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nueva búsqueda
          </Link>
        }
      />

      <SectionCard
        title="Crear nueva búsqueda"
        description="Consulta negocios reales mediante Google Places API (New), sin scraping."
        className="scroll-mt-24"
        contentClassName="p-5"
      >
        <div id="crear-busqueda">
          <SearchConfigurationForm
            isProcessing={isProcessing}
            onStart={startSearch}
          />
          {isProcessing ? <SearchProgress activeStage={activeStage} /> : null}
        </div>
      </SectionCard>

      {notification ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <span role="status" aria-live="polite">
            {notification}
          </span>
          {latestCompletedSearchId ? (
            <Link
              href={`/prospectos?searchId=${latestCompletedSearchId}`}
              className="min-h-10 rounded-lg bg-emerald-700 px-4 py-2.5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              Abrir prospectos encontrados
            </Link>
          ) : null}
        </div>
      ) : null}

      {repeatedInput ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>
            La búsqueda coincide con otra realizada durante las últimas 24
            horas.
          </span>
          <button
            type="button"
            onClick={() => startSearch(repeatedInput, true)}
            className="min-h-10 rounded-lg bg-amber-700 px-4 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
          >
            Repetir búsqueda
          </button>
        </div>
      ) : null}

      <SearchMetrics searches={searches} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.75fr)]">
        <div className="space-y-6">
          <SearchHistoryTable searches={filteredSearches} />
          <PanamaOpportunityMap />
        </div>
        <div className="space-y-6">
          <SmartFilters
            activeFilter={activeFilter}
            onChange={setActiveFilter}
          />
          <SearchSuggestions />
          <RecentActivity activities={activities.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}
