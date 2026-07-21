import { ProspectsView } from "@/components/prospects/prospects-view";
import { prospectFiltersFromSearchParams } from "@/lib/domain/prospect-filters";
import { getRepositories } from "@/lib/repositories";
import { getLatestWebsiteAudits } from "@/lib/services/website-audit-query";
import { getLatestProspectIntelligence } from "@/lib/intelligence/supabase-prospect-intelligence";

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
  const ids = visibleProspects.map((prospect) => prospect.id);
  const [audits, intelligence] = await Promise.all([
    getLatestWebsiteAudits(ids),
    getLatestProspectIntelligence(ids),
  ]);

  return (
    <ProspectsView
      initialProspects={visibleProspects}
      initialFilters={prospectFiltersFromSearchParams(params)}
      initialAudits={audits}
      initialIntelligence={intelligence}
    />
  );
}
