export const websiteAuditResults = [
  "no_website",
  "unreachable",
  "basic",
  "outdated",
  "functional",
  "strong",
] as const;

export type WebsiteAuditResult = (typeof websiteAuditResults)[number];

export type WebsiteAuditInput = {
  hasWebsite: boolean;
  reachable: boolean;
  usesHttps: boolean;
  hasMobileViewport: boolean;
  hasMetaDescription: boolean;
  hasContactMethod: boolean;
  hasBooking: boolean;
  hasServicesContent: boolean;
  brokenLinksCount: number;
  copyrightYear: number | null;
};

export function calculateWebsiteStatus(input: WebsiteAuditInput): {
  result: WebsiteAuditResult;
  warnings: string[];
} {
  if (!input.hasWebsite)
    return {
      result: "no_website",
      warnings: ["No se detectó un sitio oficial."],
    };
  if (!input.reachable)
    return {
      result: "unreachable",
      warnings: ["El sitio no respondió correctamente."],
    };

  const warnings: string[] = [];
  if (!input.usesHttps) warnings.push("El sitio no utiliza HTTPS.");
  if (!input.hasMobileViewport) warnings.push("No declara una vista móvil.");
  if (!input.hasMetaDescription) warnings.push("No tiene meta descripción.");
  if (input.brokenLinksCount > 0)
    warnings.push(
      `Se detectaron ${input.brokenLinksCount} enlaces internos rotos en la muestra.`,
    );
  if (
    input.copyrightYear &&
    input.copyrightYear < new Date().getUTCFullYear() - 2
  )
    warnings.push("El copyright visible parece desactualizado.");

  const outdated =
    !input.hasMobileViewport ||
    !input.usesHttps ||
    warnings.some((item) => item.includes("copyright"));
  const core =
    input.usesHttps && input.hasMobileViewport && input.hasMetaDescription;
  if (
    core &&
    input.hasContactMethod &&
    input.hasServicesContent &&
    input.hasBooking &&
    input.brokenLinksCount === 0
  )
    return { result: "strong", warnings };
  if (core && input.hasContactMethod && input.hasServicesContent)
    return { result: "functional", warnings };
  if (outdated) return { result: "outdated", warnings };
  return { result: "basic", warnings };
}

export function mapAuditResultToProspectStatus(result: WebsiteAuditResult) {
  if (result === "no_website") return "sin-sitio" as const;
  if (result === "outdated") return "desactualizado" as const;
  if (result === "basic") return "basico" as const;
  if (result === "functional" || result === "strong")
    return "optimizado" as const;
  return "desconocido" as const;
}
