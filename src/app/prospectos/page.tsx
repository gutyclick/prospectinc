import { ProspectsView } from "@/components/prospects/prospects-view";
import { prospectFiltersFromSearchParams } from "@/lib/domain/prospect-filters";
import { getRepositories } from "@/lib/repositories";
import { getLatestWebsiteAudits } from "@/lib/services/website-audit-query";

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
  const searchId = params.get("searchId");
  const visibleProspects = searchId
    ? prospects.filter((prospect) => prospect.searchId === searchId)
    : prospects;
  const audits = await getLatestWebsiteAudits(
    visibleProspects.map((prospect) => prospect.id),
  );

  return (
    <ProspectsView
      initialProspects={visibleProspects}
      initialFilters={prospectFiltersFromSearchParams(params)}
      initialAudits={audits}
    />
  );
}
