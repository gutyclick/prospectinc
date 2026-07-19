import { ProspectsView } from "@/components/prospects/prospects-view";
import { prospectFiltersFromSearchParams } from "@/lib/domain/prospect-filters";
import { getRepositories } from "@/lib/repositories";

type ProspectosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProspectosPage({
  searchParams,
}: ProspectosPageProps) {
  const repositories = await getRepositories();
  const [prospects, resolvedSearchParams] = await Promise.all([
    repositories.prospects.getAll(),
    searchParams,
  ]);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (typeof value === "string") params.set(key, value);
  }

  return (
    <ProspectsView
      initialProspects={prospects}
      initialFilters={prospectFiltersFromSearchParams(params)}
    />
  );
}
