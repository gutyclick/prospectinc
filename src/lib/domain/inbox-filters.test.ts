import { describe, expect, it } from "vitest";

import type { InboxItem } from "@/lib/domain";
import { mockConversations, mockProspects } from "@/lib/mock-data";

import { getInboxCounts, matchesInboxFilter } from "./inbox-filters";

const items = mockConversations.map((conversation) => ({
  ...conversation,
  prospect: mockProspects.find(
    (prospect) => prospect.id === conversation.prospectId,
  )!,
})) satisfies InboxItem[];

describe("filtros de bandeja", () => {
  it("filtra estados y calcula contadores desde los datos", () => {
    expect(
      items.filter((item) => matchesInboxFilter(item, "por-contactar")),
    ).toHaveLength(1);
    expect(
      items.filter((item) => matchesInboxFilter(item, "respondieron")),
    ).toHaveLength(1);
    expect(getInboxCounts(items)).toMatchObject({
      todos: 5,
      "por-contactar": 1,
      enviados: 1,
      respondieron: 1,
      seguimiento: 1,
    });
  });
});
