export type BusinessSearchInput = {
  niche: string;
  location: string;
  country?: string;
  limit: number;
  signal?: AbortSignal;
};

export type DiscoveredBusiness = {
  placeId: string;
  displayName: string;
  formattedAddress: string | null;
  primaryType: string | null;
  websiteUrl: string | null;
  sourceUrl: string;
};

export type BusinessDiscoveryResult = {
  businesses: DiscoveredBusiness[];
  requestCount: 1;
  attribution: {
    provider: "google_places" | "fake";
    label: string;
    url: string | null;
  };
};

export interface BusinessDiscoveryProvider {
  search(input: BusinessSearchInput): Promise<BusinessDiscoveryResult>;
}

export class FakeBusinessDiscoveryProvider implements BusinessDiscoveryProvider {
  constructor(private readonly businesses: DiscoveredBusiness[] = []) {}

  async search(input: BusinessSearchInput): Promise<BusinessDiscoveryResult> {
    void input;
    return {
      businesses: [...this.businesses],
      requestCount: 1,
      attribution: { provider: "fake", label: "Datos de prueba", url: null },
    };
  }
}

export type DiscoveryErrorCode =
  | "credentials"
  | "rate-limit"
  | "timeout"
  | "invalid-response"
  | "provider-unavailable";

export class BusinessDiscoveryError extends Error {
  constructor(
    message: string,
    readonly code: DiscoveryErrorCode,
  ) {
    super(message);
    this.name = "BusinessDiscoveryError";
  }
}
