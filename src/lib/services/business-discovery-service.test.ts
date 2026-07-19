import { describe, expect, it } from "vitest";

import {
  assertSearchCanRun,
  deduplicateBusinesses,
  getSearchFingerprint,
} from "./business-discovery-service";

describe("BusinessDiscoveryService", () => {
  it("deduplica resultados por google place id", () => {
    expect(
      deduplicateBusinesses([
        { placeId: "a", name: "Primero" },
        { placeId: "a", name: "Duplicado" },
        { placeId: "b", name: "Segundo" },
      ]),
    ).toEqual([
      { placeId: "a", name: "Primero" },
      { placeId: "b", name: "Segundo" },
    ]);
  });

  it("identifica búsquedas repetidas aunque cambien mayúsculas y espacios", () => {
    const first = getSearchFingerprint({
      niche: " Dentistas ",
      location: "Ciudad de Panamá",
      country: "Panamá",
      limit: 20,
    });
    const repeated = getSearchFingerprint({
      niche: "dentistas",
      location: "CIUDAD DE PANAMÁ",
      country: "panamá",
      limit: 20,
    });
    expect(repeated).toBe(first);
    expect(() => assertSearchCanRun(1, false)).toThrow(
      "Confirma si deseas repetirla",
    );
    expect(() => assertSearchCanRun(1, true)).not.toThrow();
  });
});
