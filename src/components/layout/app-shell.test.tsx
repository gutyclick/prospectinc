import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "./app-shell";
import { navigationItems } from "./navigation-items";

vi.mock("next/navigation", () => ({
  usePathname: () => "/prospectos",
}));

describe("AppShell", () => {
  it("renderiza la navegación, la barra superior y el contenido", () => {
    render(
      <AppShell>
        <h1>Prospectos</h1>
      </AppShell>,
    );

    expect(screen.getByLabelText("Navegación principal")).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: /buscar negocio/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Prospectos" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Guzz")).not.toHaveLength(0);
  });

  it("marca automáticamente la ruta activa", () => {
    render(<AppShell>Contenido</AppShell>);

    expect(screen.getByRole("link", { name: "Prospectos" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("expone enlaces accesibles para todas las secciones", () => {
    render(<AppShell>Contenido</AppShell>);

    for (const item of navigationItems) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    }
    expect(navigationItems.map((item) => item.label)).toEqual([
      "Inicio",
      "Búsquedas",
      "Prospectos",
      "Propuestas",
      "Bandeja",
      "Configuración",
    ]);
    expect(
      screen.queryByRole("link", { name: "Contactados" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Respuestas" }),
    ).not.toBeInTheDocument();
  });
});
