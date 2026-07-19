import { DashboardView } from "@/components/dashboard/dashboard-view";
import {
  activityRepository,
  getDashboardMetrics,
  getProspectingFunnel,
  getTodayRecommendations,
  prospectRepository,
} from "@/lib/repositories";

export default async function HomePage() {
  const [metrics, prospects, activities, funnel, recommendations] =
    await Promise.all([
      getDashboardMetrics(),
      prospectRepository.getPriorityProspects(5),
      activityRepository.getRecentActivities(4),
      getProspectingFunnel(),
      getTodayRecommendations(),
    ]);

  return (
    <DashboardView
      metrics={metrics}
      prospects={prospects}
      activities={activities}
      funnel={funnel}
      recommendations={recommendations}
    />
  );
}
