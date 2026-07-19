import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/app/actions/data", async () => {
  const repositories = await import("@/lib/repositories");
  return {
    createSearchAction: async (
      values: Parameters<typeof repositories.searchRepository.createSearch>[0],
    ) => ({
      ok: true,
      data: await repositories.searchRepository.createSearch(values),
    }),
    completeSearchAction: async (id: string) => ({
      ok: true,
      data: await repositories.searchRepository.completeSearch(id),
    }),
    discoverBusinessesAction: async (
      values: Parameters<typeof repositories.searchRepository.createSearch>[0],
    ) => {
      await new Promise((resolve) => setTimeout(resolve, 75));
      const created = await repositories.searchRepository.createSearch(values);
      const search = await repositories.searchRepository.completeSearch(
        created.id,
      );
      return {
        ok: true,
        data: {
          search: {
            ...search,
            insertedCount: search.resultsCount,
            providerCallCount: 1,
          },
          inserted: search.resultsCount,
          deduplicated: 0,
          providerCalls: 1,
        },
      };
    },
    createProspectAction: async (
      values: Parameters<
        typeof repositories.prospectRepository.createProspect
      >[0],
    ) => ({
      ok: true,
      data: await repositories.prospectRepository.createProspect(values),
    }),
    updateProspectStatusAction: async (
      id: string,
      status: Parameters<
        typeof repositories.prospectRepository.updateCommercialStatus
      >[1],
    ) => ({
      ok: true,
      data: await repositories.prospectRepository.updateCommercialStatus(
        id,
        status,
      ),
    }),
    createProposalAction: async (values: {
      prospectId: string;
      service: string;
      price: number;
      currency: "USD";
      summary: string;
      includedItems: string;
      deliveryTime: string;
      callToAction: string;
    }) => {
      const prospect = await repositories.prospectRepository.getProspectById(
        values.prospectId,
      );
      return {
        ok: true,
        data: await repositories.proposalRepository.create({
          prospectId: values.prospectId,
          service: values.service,
          price: values.price,
          currency: values.currency,
          summary: values.summary,
          includedItems: values.includedItems.split("\n").filter(Boolean),
          recommendedAngle: prospect?.recommendedOffer ?? "Oferta",
          deliveryTime: values.deliveryTime,
          callToAction: values.callToAction,
        }),
      };
    },
    updateProposalStatusAction: async (
      id: string,
      status: Parameters<
        typeof repositories.proposalRepository.updateStatus
      >[1],
    ) => ({
      ok: true,
      data: await repositories.proposalRepository.updateStatus(id, status),
    }),
    getInboxItemsAction: async () => ({
      ok: true,
      data: await repositories.conversationRepository.getInboxItems(50),
    }),
    getDraftResponseAction: async (id: string) => ({
      ok: true,
      data: await repositories.conversationRepository.getDraftResponse(id),
    }),
    saveDraftResponseAction: async (id: string, response: string) => {
      await repositories.conversationRepository.saveDraftResponse(id, response);
      return { ok: true, data: null };
    },
    markResponseSentAction: async (id: string, response: string) => ({
      ok: true,
      data: await repositories.conversationRepository.markResponseSent(
        id,
        response,
      ),
    }),
    transitionConversationAction: async (values: {
      id: string;
      status: Parameters<
        typeof repositories.conversationRepository.updateStatus
      >[1];
      commercialStatus: Parameters<
        typeof repositories.prospectRepository.updateCommercialStatus
      >[1];
      nextAction: string | null;
      followUpAt: string | null;
    }) => {
      const conversations = await repositories.conversationRepository.getAll();
      const conversation = conversations.find((item) => item.id === values.id);
      if (values.followUpAt)
        await repositories.conversationRepository.scheduleFollowUp(
          values.id,
          values.followUpAt,
        );
      else
        await repositories.conversationRepository.updateStatus(
          values.id,
          values.status,
          values.nextAction,
        );
      if (conversation)
        await repositories.prospectRepository.updateCommercialStatus(
          conversation.prospectId,
          values.commercialStatus,
        );
      return { ok: true, data: conversation };
    },
    addExclusionAction: async () => ({ ok: true, data: null }),
    importDemoDataAction: async () => ({ ok: true, data: 0 }),
  };
});

afterEach(() => {
  cleanup();
});
