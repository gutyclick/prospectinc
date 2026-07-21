import { describe, expect, it } from "vitest";
import { FakeProspectIntelligenceProvider } from "./fake-prospect-intelligence-provider";
import {
  IntelligenceProviderError,
  type ProspectAnalysis,
} from "./prospect-intelligence";
import {
  ProspectIntelligenceService,
  type ProspectIntelligenceStore,
} from "./prospect-intelligence-service";

const input = {
  businessName: "Clínica",
  niche: "Dentista",
  city: "Panamá",
  auditFacts: ["El sitio usa HTTPS."],
  verifiedContacts: [],
  allowedMetrics: {},
  availableOffer: "Sitio con reservas",
};
const context = {
  prospectId: "p1",
  commercialStatus: "nuevo",
  input,
  websiteStatus: "basic" as const,
  hasServicesContent: true,
  hasBooking: false,
};
function store(
  overrides: Partial<ProspectIntelligenceStore> = {},
): ProspectIntelligenceStore {
  return {
    findByHash: async () => null,
    countToday: async () => 0,
    save: async () => undefined,
    updateProspect: async () => undefined,
    registerActivity: async () => undefined,
    ...overrides,
  };
}

describe("servicio de inteligencia", () => {
  it("reutiliza un análisis idéntico", async () => {
    const fake = new FakeProspectIntelligenceProvider();
    const cached = await fake.analyzeProspect(input);
    const result = await new ProspectIntelligenceService(
      fake,
      store({ findByHash: async () => cached }),
    ).analyze(context);
    expect(result.cached).toBe(true);
  });
  it("respeta el límite diario", async () => {
    await expect(
      new ProspectIntelligenceService(
        new FakeProspectIntelligenceProvider(),
        store({ countToday: async () => 50 }),
        50,
      ).analyze(context),
    ).rejects.toMatchObject({ code: "rate-limit" });
  });
  it("rechaza hechos inventados", async () => {
    class Inventor extends FakeProspectIntelligenceProvider {
      override async analyzeProspect(
        value: typeof input,
      ): Promise<ProspectAnalysis> {
        return {
          ...(await super.analyzeProspect(value)),
          verifiedFacts: ["El propietario se llama Juan."],
        };
      }
    }
    await expect(
      new ProspectIntelligenceService(new Inventor(), store()).analyze(context),
    ).rejects.toBeInstanceOf(IntelligenceProviderError);
  });
  it("requiere hechos de auditoría", async () => {
    await expect(
      new ProspectIntelligenceService(
        new FakeProspectIntelligenceProvider(),
        store(),
      ).analyze({ ...context, input: { ...input, auditFacts: [] } }),
    ).rejects.toThrow();
  });
});
