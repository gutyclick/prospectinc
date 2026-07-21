import { describe, expect, it } from "vitest";
import { calculateWebsiteStatus } from "./website-audit";

const base = {
  hasWebsite: true,
  reachable: true,
  usesHttps: true,
  hasMobileViewport: true,
  hasMetaDescription: true,
  hasContactMethod: true,
  hasBooking: false,
  hasServicesContent: true,
  brokenLinksCount: 0,
  copyrightYear: 2026,
};

describe("estado web determinístico", () => {
  it("distingue sitio inexistente e inaccesible", () => {
    expect(calculateWebsiteStatus({ ...base, hasWebsite: false }).result).toBe(
      "no_website",
    );
    expect(calculateWebsiteStatus({ ...base, reachable: false }).result).toBe(
      "unreachable",
    );
  });
  it("clasifica sitios funcionales y fuertes", () => {
    expect(calculateWebsiteStatus(base).result).toBe("functional");
    expect(calculateWebsiteStatus({ ...base, hasBooking: true }).result).toBe(
      "strong",
    );
  });
  it("marca una experiencia no móvil como desactualizada", () => {
    expect(
      calculateWebsiteStatus({ ...base, hasMobileViewport: false }).result,
    ).toBe("outdated");
  });
});
