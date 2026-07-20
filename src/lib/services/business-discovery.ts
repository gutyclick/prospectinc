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
  latitude: number | null;
  longitude: number | null;
  websiteUrl: string | null;
  phone: string | null;
  sourceUrl: string;
  rating: number | null;
  reviewsCount: number | null;
};

export interface BusinessDiscoveryProvider {
  search(input: BusinessSearchInput): Promise<DiscoveredBusiness[]>;
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
