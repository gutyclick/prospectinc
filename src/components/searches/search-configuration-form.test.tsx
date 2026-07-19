import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SearchConfigurationForm } from "./search-configuration-form";

describe("formulario de búsqueda", () => {
  it("muestra errores accesibles cuando faltan los campos requeridos", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<SearchConfigurationForm isProcessing={false} onStart={onStart} />);

    await user.click(screen.getByRole("button", { name: "Iniciar análisis" }));

    expect(
      await screen.findByText("Escribe un nicho o tipo de negocio."),
    ).toBeInTheDocument();
    expect(screen.getByText("Escribe una ubicación.")).toBeInTheDocument();
    expect(onStart).not.toHaveBeenCalled();
  });

  it("valida el límite máximo de resultados", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<SearchConfigurationForm isProcessing={false} onStart={onStart} />);

    await user.type(
      screen.getByLabelText("Nicho o tipo de negocio"),
      "Dentistas",
    );
    await user.type(screen.getByLabelText("Ubicación"), "Ciudad de Panamá");
    await user.clear(screen.getByLabelText("Cantidad de resultados"));
    await user.type(screen.getByLabelText("Cantidad de resultados"), "21");
    await user.click(screen.getByRole("button", { name: "Iniciar análisis" }));

    expect(
      await screen.findByText(
        "Google Places admite hasta 20 resultados por búsqueda.",
      ),
    ).toBeInTheDocument();
    expect(onStart).not.toHaveBeenCalled();
  });
});
