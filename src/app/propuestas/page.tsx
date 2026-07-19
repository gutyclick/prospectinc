import { ProposalsView } from "@/components/proposals/proposals-view";
import { getRepositories } from "@/lib/repositories";

export default async function PropuestasPage({
  searchParams,
}: {
  searchParams: Promise<{ prospectId?: string }>;
}) {
  const repositories = await getRepositories();
  const [proposals, prospects, params] = await Promise.all([
    repositories.proposals.getAll(),
    repositories.prospects.getAll(),
    searchParams,
  ]);
  const validProspectId = prospects.some(
    (prospect) => prospect.id === params.prospectId,
  )
    ? params.prospectId
    : undefined;
  return (
    <ProposalsView
      initialProposals={proposals}
      prospects={prospects}
      initialProspectId={validProspectId}
    />
  );
}
