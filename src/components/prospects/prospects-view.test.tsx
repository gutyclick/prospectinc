import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_PROSPECT_FILTERS } from "@/lib/domain/prospect-filters";
import { prospectRepository } from "@/lib/repositories";

import { ProspectsView } from "./prospects-view";

async function renderProspectsView() {
  const prospects = await prospectRepository.getAll();
  render(
    <ProspectsView
      initialProspects={prospects}
      initialFilters={DEFAULT_PROSPECT_FILTERS}
    />,
  );
}

describe("centro de prospectos", () => {
  beforeEach(() => {
    prospectRepository.reset();
  });

  it("filtra la tabla y conserva el filtro en la URL", async () => {
    const user = userEvent.setup();
    await renderProspectsView();

    await user.type(screen.getByLabelText("Filtrar prospectos"), "Taller");

    expect(screen.getByText("Taller AutoMax")).toBeInTheDocument();
    expect(
      screen.queryByText("Restaurante La Toscana"),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(window.location.search).toContain("q=Taller"));
  });

  it("selecciona un prospecto y muestra su vista rápida", async () => {
    const user = userEvent.setup();
    await renderProspectsView();

    await user.click(
      screen.getByRole("button", { name: "Ver Taller AutoMax" }),
    );

    expect(
      screen.getByRole("heading", { name: "Taller AutoMax" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/sitio antiguo que no comunica/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Crear propuesta" }),
    ).toHaveAttribute("href", "/propuestas?prospectId=prospect-taller-automax");
  });

  it("exporta únicamente la lista visible como CSV", async () => {
    const user = userEvent.setup();
    const createObjectUrl = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:prospectos");
    const revokeObjectUrl = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    await renderProspectsView();

    await user.type(screen.getByLabelText("Filtrar prospectos"), "Taller");
    await user.click(screen.getByRole("button", { name: "Exportar lista" }));

    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:prospectos");
    expect(
      screen.getByText("Se exportaron 1 prospectos visibles."),
    ).toBeInTheDocument();
  });

  it("permite iniciar un reanálisis manual del sitio", async () => {
    const user = userEvent.setup();
    await renderProspectsView();

    await user.click(
      screen.getByRole("button", { name: "Ver Taller AutoMax" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Reanalizar sitio web" }),
    );

    expect(
      await screen.findByText(/análisis del sitio se inició en segundo plano/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Análisis en curso…" }),
    ).toBeDisabled();
  });

  it("añade manualmente un prospecto al repositorio y a la tabla", async () => {
    const user = userEvent.setup();
    await renderProspectsView();

    await user.click(screen.getByRole("button", { name: "Añadir prospecto" }));
    const dialog = screen.getByRole("dialog", { name: "Añadir prospecto" });
    await user.type(
      within(dialog).getByLabelText("Nombre del negocio"),
      "Café Horizonte",
    );
    await user.type(within(dialog).getByLabelText("Nicho"), "Cafetería");
    await user.type(
      within(dialog).getByLabelText("Ubicación"),
      "Ciudad de Panamá",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Añadir prospecto" }),
    );

    expect(
      await screen.findByText("Café Horizonte se guardó correctamente."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Café Horizonte")).not.toHaveLength(0);
    await expect(prospectRepository.getAll()).resolves.toHaveLength(7);
  });
});
