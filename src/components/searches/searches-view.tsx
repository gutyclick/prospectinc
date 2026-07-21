"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";

import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  analyzeSearchWebsitesAction,
  discoverBusinessesAction,
  getSearchStatusAction,
  retryDiscoveryAction,
} from "@/app/actions/data";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/ui/section-card";
import type { Activity, Search as SearchRecord } from "@/lib/domain";
import type { SearchFormValues } from "@/lib/validation";
import type { discoverBusinesses } from "@/trigger/discover-businesses";

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
  stageDelayMs,
}: SearchesViewProps) {
  const [searches, setSearches] = useState(initialSearches);
  const [activities] = useState(initialActivities);
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("todos");
  const initialActiveSearch = initialSearches.find(
    (search) => search.status === "analizando" && Boolean(search.externalRunId),
  );
  const [isProcessing, setIsProcessing] = useState(
    Boolean(initialActiveSearch),
  );
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationTone, setNotificationTone] = useState<"success" | "error">(
    "success",
  );
  const [activeRun, setActiveRun] = useState<{
    runId: string;
    token: string;
    searchId: string;
  } | null>(
    initialActiveSearch
      ? {
          runId: initialActiveSearch.externalRunId ?? "",
          token: "",
          searchId: initialActiveSearch.id,
        }
      : null,
  );
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [analyzingSitesId, setAnalyzingSitesId] = useState<string | null>(null);
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
  const { run: realtimeRun } = useRealtimeRun<typeof discoverBusinesses>(
    activeRun?.runId || undefined,
    {
      accessToken: activeRun?.token,
      enabled: Boolean(activeRun?.runId && activeRun.token),
    },
  );
  const activeSearch = activeRun
    ? searches.find((search) => search.id === activeRun.searchId)
    : null;

  useEffect(() => {
    if (!activeRun) return;
    const currentRun = activeRun;
    let cancelled = false;
    async function refresh() {
      const result = await getSearchStatusAction(currentRun.searchId);
      if (cancelled || !result.ok) return;
      const updated = result.data;
      setSearches((current) => [
        updated,
        ...current.filter((search) => search.id !== updated.id),
      ]);
      if (updated.status === "completada") {
        setIsProcessing(false);
        setLatestCompletedSearchId(updated.id);
        setNotificationTone("success");
        setNotification(
          `Búsqueda completada: ${updated.insertedCount} negocios nuevos y ${updated.deduplicatedCount} deduplicados.`,
        );
        setActiveRun(null);
      } else if (updated.status === "fallida") {
        setIsProcessing(false);
        setNotificationTone("error");
        setNotification(updated.errorMessage ?? "La tarea de búsqueda falló.");
        setActiveRun(null);
      }
    }
    void refresh();
    const timer = window.setInterval(refresh, stageDelayMs ?? 2_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeRun, realtimeRun?.metadata, stageDelayMs]);

  async function startSearch(
    values: SearchFormValues,
    confirmRepeated = false,
  ) {
    const repeatedSearchConfirmed = confirmRepeated === true;
    setNotification(null);
    setNotificationTone("success");
    setRepeatedInput(null);
    setIsProcessing(true);

    try {
      const result = await discoverBusinessesAction({
        ...values,
        confirmRepeated: repeatedSearchConfirmed,
      });
      if (!result.ok) {
        if (result.requiresConfirmation) setRepeatedInput(values);
        throw new Error(result.error);
      }
      const { search: queued, runId, publicAccessToken } = result.data;
      setSearches((current) => [
        queued,
        ...current.filter((item) => item.id !== queued.id),
      ]);
      setActiveRun({ runId, token: publicAccessToken, searchId: queued.id });
      setNotification(
        "La búsqueda fue encolada y continuará en segundo plano.",
      );
    } catch (error) {
      setIsProcessing(false);
      setNotificationTone("error");
      setNotification(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la búsqueda. Intenta nuevamente.",
      );
    }
  }

  async function retrySearch(searchId: string) {
    setRetryingId(searchId);
    setNotification(null);
    const result = await retryDiscoveryAction(searchId);
    setRetryingId(null);
    if (!result.ok) {
      setNotificationTone("error");
      setNotification(result.error);
      return;
    }
    setSearches((current) => [
      result.data.search,
      ...current.filter((search) => search.id !== searchId),
    ]);
    setActiveRun({
      runId: result.data.runId,
      token: result.data.publicAccessToken,
      searchId,
    });
    setIsProcessing(true);
    setNotificationTone("success");
    setNotification("La búsqueda fallida se volvió a encolar.");
  }

  async function analyzeSites(searchId: string) {
    setAnalyzingSitesId(searchId);
    const result = await analyzeSearchWebsitesAction(searchId);
    if (!result.ok) {
      setAnalyzingSitesId(null);
      setNotificationTone("error");
      setNotification(result.error);
      return;
    }
    setAnalyzingSitesId(null);
    setNotificationTone("success");
    setNotification(
      "Los sitios provisionales se enviaron al analizador. El botón no implica que el análisis haya finalizado.",
    );
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
          {isProcessing && activeSearch ? (
            <SearchProgress
              stage={activeSearch.processingStage}
              progress={activeSearch.progress}
            />
          ) : null}
        </div>
      </SectionCard>

      {notification ? (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
            notificationTone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
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
          <SearchHistoryTable
            searches={filteredSearches}
            onRetry={retrySearch}
            retryingId={retryingId}
            onAnalyzeSites={(id) => void analyzeSites(id)}
            analyzingSitesId={analyzingSitesId}
          />
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
            Los resultados de descubrimiento y sus sitios son datos temporales
            proporcionados por{" "}
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Google Places
            </a>
            . Se consideran provisionales hasta verificarlos en el sitio
            oficial.
          </p>
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
