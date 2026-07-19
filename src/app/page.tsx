import { DashboardView } from "@/components/dashboard/dashboard-view";
import {
  getDashboardMetrics,
  getProspectingFunnel,
  getRepositories,
  getTodayRecommendations,
} from "@/lib/repositories";

export default async function HomePage() {
  const repositories = await getRepositories();
  const [metrics, prospects, activities, funnel, recommendations] =
    await Promise.all([
      getDashboardMetrics(repositories),
      repositories.prospects.getPriorityProspects(5),
      repositories.activities.getRecentActivities(4),
      getProspectingFunnel(repositories),
      getTodayRecommendations(repositories),
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
