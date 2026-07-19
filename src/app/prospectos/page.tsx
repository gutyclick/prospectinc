import { ProspectsView } from "@/components/prospects/prospects-view";
import { requireOwner } from "@/lib/auth/require-owner";
import { prospectFiltersFromSearchParams } from "@/lib/domain/prospect-filters";
import { prospectRepository } from "@/lib/repositories";

type ProspectosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProspectosPage({
  searchParams,
}: ProspectosPageProps) {
  await requireOwner();
  const [prospects, resolvedSearchParams] = await Promise.all([
    prospectRepository.getAll(),
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
