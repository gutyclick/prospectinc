import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  BusinessDiscoveryError,
  FakeBusinessDiscoveryProvider,
} from "./business-discovery";
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
  it("normaliza Text Search y admite resultados sin sitio", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response({
        places: [
          {
            id: "place-1",
            displayName: { text: "Clínica Uno" },
            formattedAddress: "Panamá",
            primaryType: "dentist",
            googleMapsUri: "https://maps.google.com/?cid=1",
          },
          {
            id: "place-2",
            displayName: { text: "Clínica Dos" },
            googleMapsUri: "https://maps.google.com/?cid=2",
            websiteUri: "https://clinica.example",
          },
        ],
      }),
    );
    const result = await new GooglePlacesDiscoveryProvider({
      apiKey: "test-key",
      fetcher,
    }).search(input);

    expect(result.businesses[0]).toMatchObject({ websiteUrl: null });
    expect(result.businesses[1]).toMatchObject({
      websiteUrl: "https://clinica.example",
    });
    expect(result.attribution.label).toBe("Google Places");
    expect(fetcher).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:searchText",
      expect.objectContaining({ method: "POST" }),
    );
    const [, init] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({
      languageCode: "es",
      regionCode: "PA",
      pageSize: 10,
    });
  });

  it("devuelve una colección vacía con atribución", async () => {
    const result = await new GooglePlacesDiscoveryProvider({
      apiKey: "test-key",
      fetcher: vi.fn().mockResolvedValue(response({})),
    }).search(input);
    expect(result.businesses).toEqual([]);
    expect(result.requestCount).toBe(1);
  });

  it("ofrece un proveedor falso reemplazable para pruebas", async () => {
    const result = await new FakeBusinessDiscoveryProvider([
      {
        placeId: "fake-1",
        displayName: "Negocio de prueba",
        formattedAddress: null,
        primaryType: null,
        websiteUrl: null,
        sourceUrl: "https://example.test/source",
      },
    ]).search(input);
    expect(result.businesses).toHaveLength(1);
    expect(result.attribution.provider).toBe("fake");
  });

  it("traduce rate limit, credenciales y respuestas inválidas", async () => {
    const cases = [
      { status: 429, code: "rate-limit" },
      { status: 401, code: "credentials" },
      { status: 403, code: "credentials" },
      { status: 500, code: "provider-unavailable" },
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

  it("no reintenta errores que no sean 429 o 5xx", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("network"));
    const provider = new GooglePlacesDiscoveryProvider({
      apiKey: "test-key",
      fetcher,
      maxAttempts: 3,
    });
    await expect(provider.search(input)).rejects.toMatchObject({
      code: "provider-unavailable",
    });
    expect(fetcher).toHaveBeenCalledOnce();
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
    expect(GOOGLE_PLACES_FIELD_MASK).not.toContain("rating");
    expect(GOOGLE_PLACES_FIELD_MASK).not.toContain("PhoneNumber");
    expect(GOOGLE_PLACES_FIELD_MASK).not.toContain("location");
    expect(GOOGLE_PLACES_FIELD_MASK).not.toContain("*");
    expect(
      readFileSync(resolve(process.cwd(), ".env.example"), "utf8"),
    ).not.toContain("NEXT_PUBLIC_GOOGLE_PLACES_API_KEY");
  });
});
