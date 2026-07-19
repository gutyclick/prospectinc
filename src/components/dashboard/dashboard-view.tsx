import { Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import type {
  Activity,
  DashboardMetrics,
  Prospect,
  ProspectingFunnel,
  TodayRecommendation,
} from "@/lib/domain";

import { DashboardMetricsGrid } from "./dashboard-metrics-grid";
import { PriorityProspectsTable } from "./priority-prospects-table";
import { ProspectingFunnel as ProspectingFunnelView } from "./prospecting-funnel";
import { QuickActions } from "./quick-actions";
import { RecentActivity } from "./recent-activity";
import { TodayFocus } from "./today-focus";

type DashboardViewProps = {
  metrics: DashboardMetrics;
  prospects: Prospect[];
  activities: Activity[];
  funnel: ProspectingFunnel;
  recommendations: TodayRecommendation[];
  now?: Date;
};

export function DashboardView({
  metrics,
  prospects,
  activities,
  funnel,
  recommendations,
  now,
}: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buenos días, Guzz"
        description="Estas son tus mejores oportunidades de hoy."
        action={
          <Link
            href="/busquedas"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-[var(--shadow-brand)] hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nueva búsqueda
          </Link>
        }
      />

      <DashboardMetricsGrid metrics={metrics} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(21rem,0.85fr)]">
        <div className="space-y-6">
          <PriorityProspectsTable prospects={prospects} />
          <ProspectingFunnelView funnel={funnel} />
        </div>
        <div className="space-y-6">
          <RecentActivity activities={activities} now={now} />
          <QuickActions />
          <TodayFocus recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
}
