export const DISCOVERY_TRANSITIONS = [
  { stage: "pendiente", progress: 0 },
  { stage: "descubriendo", progress: 15 },
  { stage: "guardando", progress: 55 },
  { stage: "preparando", progress: 80 },
  { stage: "finalizado", progress: 100 },
] as const;

type WebsiteCandidate = { id: string; website_url: string | null };

export function selectProspectsForAnalysis(
  prospects: WebsiteCandidate[],
  recentlyAuditedIds: ReadonlySet<string>,
  force: boolean,
) {
  return prospects.filter(
    (prospect) =>
      Boolean(prospect.website_url) &&
      (force || !recentlyAuditedIds.has(prospect.id)),
  );
}
