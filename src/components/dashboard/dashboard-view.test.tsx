import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  getDashboardMetrics,
  getProspectingFunnel,
  getTodayRecommendations,
} from "@/lib/repositories";

import { DashboardMetricsGrid } from "./dashboard-metrics-grid";
import { ProspectingFunnel } from "./prospecting-funnel";
import { QuickActions } from "./quick-actions";
import { TodayFocus } from "./today-focus";

describe("resumen del dashboard", () => {
  it("renderiza las métricas calculadas por el repositorio", async () => {
    const metrics = await getDashboardMetrics();
    render(<DashboardMetricsGrid metrics={metrics} />);

    const expectedMetrics = [
      ["Negocios encontrados", "6"],
      ["Oportunidades fuertes", "3"],
      ["Propuestas listas", "1"],
      ["Respuestas", "1"],
    ];

    for (const [label, value] of expectedMetrics) {
      const card = screen.getByText(label).closest("article");
      expect(card).not.toBeNull();
      expect(within(card as HTMLElement).getByText(value)).toBeInTheDocument();
    }
  });

  it("renderiza el embudo y recomendaciones determinísticas", async () => {
    const [funnel, recommendations] = await Promise.all([
      getProspectingFunnel(),
      getTodayRecommendations(),
    ]);
    render(
      <>
        <ProspectingFunnel funnel={funnel} />
        <TodayFocus recommendations={recommendations} />
      </>,
    );

    expect(screen.getByText("Encontrados")).toBeInTheDocument();
    expect(
      screen.getByText("Prioriza 2 prospectos con puntaje de 85 o más."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Revisa 2 propuestas pendientes antes de contactar."),
    ).toBeInTheDocument();
  });
});

describe("acciones rápidas", () => {
  it("enlaza cada acción con su módulo", () => {
    render(<QuickActions />);

    expect(screen.getByRole("link", { name: "Buscar nicho" })).toHaveAttribute(
      "href",
      "/busquedas",
    );
    expect(
      screen.getByRole("link", { name: "Ver prospectos" }),
    ).toHaveAttribute("href", "/prospectos");
    expect(
      screen.getByRole("link", { name: "Crear borradores" }),
    ).toHaveAttribute("href", "/propuestas");
    expect(
      screen.getByRole("link", { name: "Revisar bandeja" }),
    ).toHaveAttribute("href", "/bandeja");
  });
});
