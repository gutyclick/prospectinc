import { describe, expect, it } from "vitest";

import {
  DISCOVERY_TRANSITIONS,
  selectProspectsForAnalysis,
} from "./task-domain";

describe("tareas de procesamiento", () => {
  it("mantiene transiciones de progreso ordenadas hasta finalizar", () => {
    expect(DISCOVERY_TRANSITIONS.map((item) => item.stage)).toEqual([
      "pendiente",
      "descubriendo",
      "guardando",
      "preparando",
      "finalizado",
    ]);
    expect(DISCOVERY_TRANSITIONS.map((item) => item.progress)).toEqual([
      0, 15, 55, 80, 100,
    ]);
  });

  it("omite prospectos sin web y auditorías recientes", () => {
    const prospects = [
      { id: "sin-web", website_url: null },
      { id: "reciente", website_url: "https://reciente.example" },
      { id: "nuevo", website_url: "https://nuevo.example" },
    ];
    expect(
      selectProspectsForAnalysis(prospects, new Set(["reciente"]), false),
    ).toEqual([{ id: "nuevo", website_url: "https://nuevo.example" }]);
    expect(
      selectProspectsForAnalysis(prospects, new Set(["reciente"]), true),
    ).toHaveLength(2);
  });
});
