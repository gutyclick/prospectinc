import "server-only";

import { createHash } from "node:crypto";

import type { BusinessSearchInput } from "./business-discovery";

export class RepeatedBusinessSearchError extends Error {
  constructor() {
    super(
      "Ya realizaste una búsqueda idéntica recientemente. Confirma si deseas repetirla.",
    );
    this.name = "RepeatedBusinessSearchError";
  }
}

export function assertSearchCanRun(
  recentMatches: number,
  confirmRepeated: boolean,
) {
  if (recentMatches > 0 && !confirmRepeated) {
    throw new RepeatedBusinessSearchError();
  }
}

export function getSearchFingerprint(input: BusinessSearchInput) {
  return createHash("sha256")
    .update(
      [input.niche, input.location, input.country ?? "", input.limit]
        .map((value) => String(value).trim().toLocaleLowerCase("es"))
        .join("|"),
    )
    .digest("hex");
}

export function deduplicateBusinesses<T extends { placeId: string }>(
  businesses: T[],
) {
  const unique = new Map<string, T>();
  for (const business of businesses) {
    if (!unique.has(business.placeId)) unique.set(business.placeId, business);
  }
  return [...unique.values()];
}

export function getDiscoveryCacheExpiration(now = new Date(), ttlHours = 24) {
  return new Date(now.getTime() + ttlHours * 60 * 60 * 1_000).toISOString();
}
