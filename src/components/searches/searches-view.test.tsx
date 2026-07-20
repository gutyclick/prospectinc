import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { activityRepository, searchRepository } from "@/lib/repositories";

import { SearchesView } from "./searches-view";

async function renderSearchesView(stageDelayMs = 5) {
  const [searches, activities] = await Promise.all([
    searchRepository.getRecentSearches(10),
    activityRepository.getRecentActivities(5),
  ]);

  render(
    <SearchesView
      initialSearches={searches}
      initialActivities={activities}
      stageDelayMs={stageDelayMs}
    />,
  );
}

async function completeForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByLabelText("Nicho o tipo de negocio"),
    "Veterinarias",
  );
  await user.type(screen.getByLabelText("Ubicación"), "Ciudad de Panamá");
  await user.click(screen.getByRole("button", { name: "Iniciar análisis" }));
}

describe("flujo de búsquedas reales", () => {
  beforeEach(() => {
    searchRepository.reset();
  });

  it("inicia una búsqueda y muestra el progreso por etapas", async () => {
    const user = userEvent.setup();
    await renderSearchesView(25);

    await completeForm(user);

    const progressbar = await screen.findByRole("progressbar");
    expect(Number(progressbar.getAttribute("aria-valuenow"))).toBe(15);
    expect(await screen.findByText(/Búsqueda completada:/)).toBeInTheDocument();
  });

  it("actualiza los resultados sin recargar al completar el análisis", async () => {
    const user = userEvent.setup();
    await renderSearchesView();

    await completeForm(user);

    expect(await screen.findByText(/Búsqueda completada:/)).toBeInTheDocument();
    expect(screen.getAllByText("Veterinarias")).not.toHaveLength(0);
    expect(
      screen.getByRole("link", { name: "Abrir prospectos encontrados" }),
    ).toBeInTheDocument();
  });

  it("filtra el historial por estado", async () => {
    const user = userEvent.setup();
    await renderSearchesView();

    await user.click(screen.getByRole("button", { name: "Completadas" }));
    expect(screen.getByText("Clínicas dentales")).toBeInTheDocument();
    expect(screen.queryByText("Talleres automotrices")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Analizando" }));
    expect(screen.getByText("Talleres automotrices")).toBeInTheDocument();
    expect(screen.queryByText("Clínicas dentales")).not.toBeInTheDocument();
  });

  it("expone atribución y prepara el análisis sin fingir que terminó", async () => {
    const user = userEvent.setup();
    await renderSearchesView();

    expect(
      screen.getByText(/datos temporales proporcionados por/i),
    ).toBeInTheDocument();
    await user.click(
      screen.getAllByRole("button", { name: "Analizar sitios encontrados" })[0],
    );
    expect(
      await screen.findByText(/no implica que el análisis haya finalizado/i),
    ).toBeInTheDocument();
  });
});
