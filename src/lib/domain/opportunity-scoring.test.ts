import { describe, expect, it } from "vitest";
import { calculateHybridOpportunityScore } from "./opportunity-scoring";

describe("puntaje híbrido", () => {
  it("siempre limita el resultado a 0-100", () => {
    expect(
      calculateHybridOpportunityScore({
        websiteStatus: "no_website",
        verifiedContactCount: 50,
        hasServicesContent: true,
        hasBooking: true,
        nicheKnown: true,
        aiScore: 1000,
        aiConfidence: 4,
      }),
    ).toBeLessThanOrEqual(100);
  });
  it("pondera más una brecha verificable y contacto disponible", () => {
    const common = {
      verifiedContactCount: 1,
      hasServicesContent: true,
      hasBooking: false,
      nicheKnown: true,
      aiScore: 50,
      aiConfidence: 0.8,
    };
    expect(
      calculateHybridOpportunityScore({ ...common, websiteStatus: "outdated" }),
    ).toBeGreaterThan(
      calculateHybridOpportunityScore({ ...common, websiteStatus: "strong" }),
    );
  });
});
