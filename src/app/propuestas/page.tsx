import { ProposalsView } from "@/components/proposals/proposals-view";
import { proposalRepository, prospectRepository } from "@/lib/repositories";

export default async function PropuestasPage({
  searchParams,
}: {
  searchParams: Promise<{ prospectId?: string }>;
}) {
  const [proposals, prospects, params] = await Promise.all([
    proposalRepository.getAll(),
    prospectRepository.getAll(),
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
