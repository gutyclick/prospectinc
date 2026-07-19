import type { Activity } from "@/lib/domain";
import { mockActivities } from "@/lib/mock-data";

export type ActivityRepository = {
  getAll(): Promise<Activity[]>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
};

export const activityRepository: ActivityRepository = {
  async getAll() {
    return [...mockActivities];
  },

  async getRecentActivities(limit = 5) {
    return mockActivities
      .toSorted((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      )
      .slice(0, limit);
  },
};
