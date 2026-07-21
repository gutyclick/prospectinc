import type { WebsiteAuditResult } from "./website-audit";

export type OpportunityScoreFactors = {
  websiteStatus: WebsiteAuditResult;
  verifiedContactCount: number;
  hasServicesContent: boolean;
  hasBooking: boolean;
  nicheKnown: boolean;
  aiScore: number;
  aiConfidence: number;
};

const digitalGap: Record<WebsiteAuditResult, number> = {
  no_website: 100,
  unreachable: 95,
  outdated: 85,
  basic: 65,
  functional: 30,
  strong: 5,
};

export function calculateHybridOpportunityScore(
  input: OpportunityScoreFactors,
) {
  const digital = digitalGap[input.websiteStatus] * 0.35;
  const contact = (Math.min(input.verifiedContactCount, 2) / 2) * 100 * 0.2;
  const activitySignals =
    (input.hasServicesContent ? 60 : 0) + (input.hasBooking ? 40 : 0);
  const activity = activitySignals * 0.2;
  const fit =
    (input.nicheKnown && !["strong", "functional"].includes(input.websiteStatus)
      ? 100
      : 40) * 0.15;
  const ai =
    Math.max(0, Math.min(100, input.aiScore)) *
    Math.max(0, Math.min(1, input.aiConfidence)) *
    0.1;
  return Math.round(
    Math.max(0, Math.min(100, digital + contact + activity + fit + ai)),
  );
}
