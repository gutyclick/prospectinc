import { SearchesView } from "@/components/searches/searches-view";
import { requireOwner } from "@/lib/auth/require-owner";
import { activityRepository, searchRepository } from "@/lib/repositories";

export default async function BusquedasPage() {
  await requireOwner();
  const [searches, activities] = await Promise.all([
    searchRepository.getRecentSearches(10),
    activityRepository.getRecentActivities(5),
  ]);

  return (
    <SearchesView initialSearches={searches} initialActivities={activities} />
  );
}
