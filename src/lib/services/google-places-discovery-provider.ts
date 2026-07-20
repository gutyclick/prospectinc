import "server-only";

import { z } from "zod";

import {
  BusinessDiscoveryError,
  type BusinessDiscoveryProvider,
  type BusinessSearchInput,
  type DiscoveredBusiness,
} from "./business-discovery";

const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
export const GOOGLE_PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.primaryType",
  "places.location",
  "places.websiteUri",
  "places.internationalPhoneNumber",
  "places.nationalPhoneNumber",
  "places.googleMapsUri",
  "places.rating",
  "places.userRatingCount",
].join(",");

const placeSchema = z.object({
  id: z.string().min(1),
  displayName: z.object({ text: z.string().min(1) }),
  formattedAddress: z.string().optional(),
  primaryType: z.string().optional(),
  location: z
    .object({ latitude: z.number(), longitude: z.number() })
    .optional(),
  websiteUri: z.url().optional(),
  internationalPhoneNumber: z.string().optional(),
  nationalPhoneNumber: z.string().optional(),
  googleMapsUri: z.url(),
  rating: z.number().min(0).max(5).optional(),
  userRatingCount: z.number().int().nonnegative().optional(),
});
const responseSchema = z.object({ places: z.array(placeSchema).default([]) });

type ProviderOptions = {
  apiKey?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  maxAttempts?: number;
  wait?: (milliseconds: number) => Promise<void>;
};

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

export function normalizeGooglePlace(
  raw: z.infer<typeof placeSchema>,
): DiscoveredBusiness {
  return {
    placeId: raw.id,
    displayName: raw.displayName.text,
    formattedAddress: raw.formattedAddress ?? null,
    primaryType: raw.primaryType ?? null,
    latitude: raw.location?.latitude ?? null,
    longitude: raw.location?.longitude ?? null,
    websiteUrl: raw.websiteUri ?? null,
    phone: raw.internationalPhoneNumber ?? raw.nationalPhoneNumber ?? null,
    sourceUrl: raw.googleMapsUri,
    rating: raw.rating ?? null,
    reviewsCount: raw.userRatingCount ?? null,
  };
}

export class GooglePlacesDiscoveryProvider implements BusinessDiscoveryProvider {
  private readonly apiKey: string;
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;
  private readonly wait: (milliseconds: number) => Promise<void>;

  constructor(options: ProviderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.GOOGLE_PLACES_API_KEY ?? "";
    this.fetcher = options.fetcher ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 8_000;
    this.maxAttempts = options.maxAttempts ?? 3;
    this.wait = options.wait ?? delay;
    if (!this.apiKey) {
      throw new BusinessDiscoveryError(
        "Google Places no está configurado en el servidor.",
        "credentials",
      );
    }
  }

  async search(input: BusinessSearchInput) {
    if (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > 20) {
      throw new BusinessDiscoveryError(
        "Google Places admite entre 1 y 20 resultados por búsqueda.",
        "invalid-response",
      );
    }
    const query = [input.niche, input.location, input.country]
      .filter(Boolean)
      .join(" en ");

    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const signal = input.signal
        ? AbortSignal.any([controller.signal, input.signal])
        : controller.signal;
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await this.fetcher(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": this.apiKey,
            "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK,
          },
          body: JSON.stringify({
            textQuery: query,
            languageCode: "es",
            pageSize: input.limit,
          }),
          signal,
        });
        if (response.status === 401 || response.status === 403) {
          throw new BusinessDiscoveryError(
            "Google Places rechazó las credenciales configuradas.",
            "credentials",
          );
        }
        if (response.status === 429 || response.status >= 500) {
          if (attempt < this.maxAttempts) {
            await this.wait(250 * 2 ** (attempt - 1));
            continue;
          }
          throw new BusinessDiscoveryError(
            response.status === 429
              ? "Google Places alcanzó temporalmente su límite de solicitudes."
              : "Google Places no está disponible temporalmente.",
            response.status === 429 ? "rate-limit" : "provider-unavailable",
          );
        }
        if (!response.ok) {
          throw new BusinessDiscoveryError(
            "Google Places no pudo procesar la búsqueda.",
            "invalid-response",
          );
        }
        let body: unknown;
        try {
          body = await response.json();
        } catch {
          throw new BusinessDiscoveryError(
            "Google Places devolvió una respuesta inválida.",
            "invalid-response",
          );
        }
        const parsed = responseSchema.safeParse(body);
        if (!parsed.success) {
          throw new BusinessDiscoveryError(
            "Google Places devolvió una respuesta inválida.",
            "invalid-response",
          );
        }
        return parsed.data.places.map(normalizeGooglePlace);
      } catch (error) {
        if (error instanceof BusinessDiscoveryError) throw error;
        if (
          signal.aborted ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          throw new BusinessDiscoveryError(
            "Google Places tardó demasiado en responder.",
            "timeout",
          );
        }
        if (attempt < this.maxAttempts) {
          await this.wait(250 * 2 ** (attempt - 1));
          continue;
        }
        throw new BusinessDiscoveryError(
          "No se pudo conectar con Google Places.",
          "provider-unavailable",
        );
      } finally {
        clearTimeout(timeout);
      }
    }
    throw new BusinessDiscoveryError(
      "No se pudo completar la búsqueda.",
      "provider-unavailable",
    );
  }
}
