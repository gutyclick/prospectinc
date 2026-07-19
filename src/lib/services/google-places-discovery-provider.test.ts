import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { BusinessDiscoveryError } from "./business-discovery";
import {
  GOOGLE_PLACES_FIELD_MASK,
  GooglePlacesDiscoveryProvider,
} from "./google-places-discovery-provider";

const input = {
  niche: "Dentistas",
  location: "Ciudad de Panamá",
  country: "Panamá",
  limit: 10,
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("GooglePlacesDiscoveryProvider", () => {
  it("normaliza Text Search y admite resultados sin web o teléfono", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response({
        places: [
          {
            id: "place-1",
            displayName: { text: "Clínica Uno" },
            formattedAddress: "Panamá",
            primaryType: "dentist",
            location: { latitude: 8.98, longitude: -79.52 },
            googleMapsUri: "https://maps.google.com/?cid=1",
            rating: 4.5,
            userRatingCount: 12,
          },
          {
            id: "place-2",
            displayName: { text: "Clínica Dos" },
            googleMapsUri: "https://maps.google.com/?cid=2",
            websiteUri: "https://clinica.example",
            internationalPhoneNumber: "+507 200-0000",
          },
        ],
      }),
    );
    const result = await new GooglePlacesDiscoveryProvider({
      apiKey: "test-key",
      fetcher,
    }).search(input);

    expect(result[0]).toMatchObject({ websiteUrl: null, phone: null });
    expect(result[1]).toMatchObject({
      websiteUrl: "https://clinica.example",
      phone: "+507 200-0000",
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:searchText",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("traduce rate limit, credenciales y respuestas inválidas", async () => {
    const cases = [
      { status: 429, code: "rate-limit" },
      { status: 403, code: "credentials" },
      { status: 200, code: "invalid-response", body: { places: [{}] } },
    ] as const;
    for (const item of cases) {
      const provider = new GooglePlacesDiscoveryProvider({
        apiKey: "test-key",
        maxAttempts: 1,
        fetcher: vi
          .fn()
          .mockResolvedValue(
            response("body" in item ? item.body : {}, item.status),
          ),
      });
      await expect(provider.search(input)).rejects.toMatchObject({
        code: item.code,
      });
    }
  });

  it("cancela solicitudes que exceden el timeout", async () => {
    const fetcher = vi.fn(
      (_url: URL | RequestInfo, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );
    const provider = new GooglePlacesDiscoveryProvider({
      apiKey: "test-key",
      fetcher,
      timeoutMs: 5,
    });
    await expect(provider.search(input)).rejects.toEqual(
      expect.objectContaining<Partial<BusinessDiscoveryError>>({
        code: "timeout",
      }),
    );
  });

  it("mantiene la clave fuera de URL, cuerpo, FieldMask y prefijos públicos", async () => {
    const fetcher = vi.fn().mockResolvedValue(response({ places: [] }));
    await new GooglePlacesDiscoveryProvider({
      apiKey: "secret-test-key",
      fetcher,
    }).search(input);
    const [url, init] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain("secret-test-key");
    expect(init.body).not.toContain("secret-test-key");
    expect(GOOGLE_PLACES_FIELD_MASK).not.toContain("photos");
    expect(
      readFileSync(resolve(process.cwd(), ".env.example"), "utf8"),
    ).not.toContain("NEXT_PUBLIC_GOOGLE_PLACES_API_KEY");
  });
});
