"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { RecentActivity } from "@/components/dashboard/recent-activity";
import { completeSearchAction, createSearchAction } from "@/app/actions/data";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/ui/section-card";
import type { Activity, Search as SearchRecord } from "@/lib/domain";
import type { SearchFormValues } from "@/lib/validation";

import { PanamaOpportunityMap } from "./panama-opportunity-map";
import { SearchConfigurationForm } from "./search-configuration-form";
import { SearchHistoryTable } from "./search-history-table";
import { SearchMetrics } from "./search-metrics";
import { SearchProgress, SEARCH_STAGES } from "./search-progress";
import { SearchSuggestions } from "./search-suggestions";
import { SmartFilters, type SearchFilter } from "./smart-filters";

type SearchesViewProps = {
  initialSearches: SearchRecord[];
  initialActivities: Activity[];
  stageDelayMs?: number;
};

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

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

  const filteredSearches = useMemo(
    () => filterSearches(searches, activeFilter),
    [activeFilter, searches],
  );

  async function startSearch(values: SearchFormValues) {
    setNotification(null);
    setIsProcessing(true);
    setActiveStage(0);

    try {
      const createResult = await createSearchAction(values);
      if (!createResult.ok) throw new Error(createResult.error);
      const created = createResult.data;
      setSearches((current) => [created, ...current]);

      for (let stage = 0; stage < SEARCH_STAGES.length; stage += 1) {
        setActiveStage(stage);
        await delay(stageDelayMs);
      }

      const completeResult = await completeSearchAction(created.id);
      if (!completeResult.ok) throw new Error(completeResult.error);
      const completed = completeResult.data;
      setSearches((current) =>
        current.map((search) =>
          search.id === completed.id ? completed : search,
        ),
      );
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
        `Análisis completado: ${completed.resultsCount} negocios y ${completed.opportunitiesCount} oportunidades detectadas.`,
      );
    } catch (error) {
      setNotification(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la búsqueda. Intenta nuevamente.",
      );
    } finally {
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
        description="Configura una búsqueda persistente. El descubrimiento externo se conectará en la siguiente fase."
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
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          {notification}
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
