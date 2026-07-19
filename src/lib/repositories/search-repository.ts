import type { Search, SearchSource } from "@/lib/domain";
import { mockSearches } from "@/lib/mock-data";
import { searchSchema } from "@/lib/validation";

export type CreateSearchInput = {
  query: string;
  location: string;
  resultLimit: number;
  sources: SearchSource[];
};

export type SearchRepository = {
  getAll(): Promise<Search[]>;
  getRecentSearches(limit?: number): Promise<Search[]>;
  createSearch(input: CreateSearchInput): Promise<Search>;
  completeSearch(id: string): Promise<Search>;
};

let searches: Search[] = [...mockSearches];
let sequence = 0;

export const searchRepository: SearchRepository & { reset(): void } = {
  async getAll() {
    return [...searches];
  },

  async getRecentSearches(limit = 5) {
    return searches
      .toSorted((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      )
      .slice(0, limit);
  },

  async createSearch(input) {
    sequence += 1;
    const search = searchSchema.parse({
      id: `search-temporal-${Date.now()}-${sequence}`,
      ...input,
      status: "analizando",
      resultsCount: 0,
      opportunitiesCount: 0,
      createdAt: new Date().toISOString(),
    });

    searches = [search, ...searches];
    return search;
  },

  async completeSearch(id) {
    const current = searches.find((search) => search.id === id);
    if (!current) {
      throw new Error(`No existe la búsqueda ${id}.`);
    }

    const resultsCount = Math.max(1, Math.round(current.resultLimit * 0.8));
    const completed = searchSchema.parse({
      ...current,
      status: "completada",
      resultsCount,
      opportunitiesCount: Math.max(1, Math.round(resultsCount * 0.25)),
    });

    searches = searches.map((search) =>
      search.id === id ? completed : search,
    );
    return completed;
  },

  reset() {
    searches = [...mockSearches];
    sequence = 0;
  },
};
