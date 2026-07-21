import { SearchesView } from "@/components/searches/searches-view";
import { getRepositories } from "@/lib/repositories";

export default async function BusquedasPage() {
  const repositories = await getRepositories();
  const [searches, activities] = await Promise.all([
    repositories.searches.getRecentSearches(10),
    repositories.activities.getRecentActivities(5),
  ]);

  return (
    <SearchesView initialSearches={searches} initialActivities={activities} />
  );
}
