import type { Search } from "@/lib/domain";
import { mockSearches } from "@/lib/mock-data";

export type SearchRepository = {
  getAll(): Promise<Search[]>;
  getRecentSearches(limit?: number): Promise<Search[]>;
};

export const searchRepository: SearchRepository = {
  async getAll() {
    return [...mockSearches];
  },

  async getRecentSearches(limit = 5) {
    return mockSearches
      .toSorted((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      )
      .slice(0, limit);
  },
};
