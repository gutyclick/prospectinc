import { describe, expect, it } from "vitest";

import { discoveryRequestSchema } from "./discovery-request-schema";

const validInput = {
  query: "Dentistas",
  location: "Ciudad de Panamá",
  country: "Panamá",
  resultLimit: 20,
  preferredChannel: "web-whatsapp",
  opportunityLevel: "todos",
  sources: ["google-places"],
};

describe("solicitud de descubrimiento", () => {
  it("solo acepta una confirmación literalmente verdadera", () => {
    expect(
      discoveryRequestSchema.parse({ ...validInput, confirmRepeated: true })
        .confirmRepeated,
    ).toBe(true);
  });

  it.each([undefined, false, {}, () => true])(
    "convierte un segundo argumento inesperado en false",
    (confirmRepeated) => {
      expect(
        discoveryRequestSchema.parse({ ...validInput, confirmRepeated })
          .confirmRepeated,
      ).toBe(false);
    },
  );
});
